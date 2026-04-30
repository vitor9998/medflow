import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { EvolutionProvider } from '@/lib/providers/evolutionProvider';

import { normalizePhone } from '@/lib/utils/phone';

/**
 * Worker Service para processamento de fila de mensagens WhatsApp.
 * Gerencia concorrência, travamento de mensagens e métricas.
 */
export class WhatsAppWorker {
  private provider = new EvolutionProvider();
  private batchSize = 10;
  private lockTimeoutMinutes = 2; // Tempo antes de considerar uma mensagem 'processing' como travada
  
  private lastSentPerUser = new Map<string, number>();
  private consecutiveFailures = 0;
  private readonly FAILURE_THRESHOLD = 5;

  /**
   * Executa uma rodada de processamento.
   */
  async run() {
    console.log('[WhatsAppWorker] Iniciando rodada de processamento...');
    
    // Task 3: Check instance status before sending
    const isConnected = await this.provider.isConnected();
    if (!isConnected) {
      console.warn('⚠️ [WhatsAppWorker] Instância do Evolution API não está CONECTADA. Abortando envio.');
      return;
    }

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    try {
      // 1. Manutenção: Destravar mensagens presas por timeout
      await this.unlockExpiredMessages();

      // Task 1 & 2: ATOMIC LOCK BEFORE PROCESSING (CRITICAL)
      // Usamos o RPC claim_whatsapp_messages que realiza o UPDATE e SELECT de forma atômica
      // com 'SKIP LOCKED' no banco de dados. Nunca processamos 'pending' via SELECT direto.
      const messages = await this.claimBatch();
      
      if (!messages || messages.length === 0) {
        console.log('[WhatsAppWorker] Nenhuma mensagem pendente na fila.');
        return;
      }

      console.log(`[WhatsAppWorker] 🔒 Locked messages batch: ${messages.length}`);

      // 3. Processamento Individual
      for (const msg of messages) {
        // Task 6: LOG PROCESS FLOW
        console.log("🔒 Locked message:", msg.id);

        // Task 7: Prevent session flood/issues if too many failures
        if (this.consecutiveFailures >= this.FAILURE_THRESHOLD) {
          console.error('⚠️ [WhatsAppWorker] Possível problema na sessão do WhatsApp - Muitas falhas consecutivas. Pausando processamento.');
          break;
        }

        // Task 3: DOUBLE SAFETY CHECK
        if (msg.sent_at) {
          console.log(`[WhatsAppWorker] ⚠️ Mensagem ${msg.id} já possui sent_at. Pulando.`);
          continue;
        }

        console.log("📤 Sending message:", msg.id);

        try {
          const normalizedPhone = normalizePhone(msg.phone);
          
          // Task 1 & 5: Rate Limit per User and Global
          await this.enforceRateLimit(normalizedPhone);

          let attempt = 0;
          const maxAttempts = 3;
          const backoffs = [1000, 3000, 5000];
          let lastResponse: any = null;

          while (attempt <= maxAttempts) {
            try {
              if (attempt > 0) {
                console.log(`📤 [WhatsAppWorker] RETRY: ${attempt} para mensagem ${msg.id}`);
                await new Promise(resolve => setTimeout(resolve, backoffs[attempt - 1]));
              }

              const sendStartTime = Date.now();
              lastResponse = await this.provider.sendMessage(normalizedPhone, msg.message);
              const latency = Date.now() - sendStartTime;

              // Handle PENDING status
              if (lastResponse?.status === 'PENDING' || lastResponse?.status === 'SENDING') {
                console.log(`✅ [WhatsAppWorker] Mensagem ${msg.id} aceita (status ${lastResponse.status}) pela Evolution API.`);
                // Não devemos retentar aqui. PENDING significa que a Evolution API enfileirou com sucesso.
                // Fazer 'continue' causaria reenvio da mesma mensagem, gerando duplicidade.
              }

              // Task 4: UPDATE IMMEDIATELY AFTER SEND
              await this.updateStatus(msg.id, 'sent');
              console.log("✅ Marked as sent:", msg.id);
              
              successCount++;
              this.consecutiveFailures = 0; 
              this.lastSentPerUser.set(normalizedPhone, Date.now());
              break;

            } catch (err: any) {
              attempt++;
              if (attempt > maxAttempts) throw err;
              console.warn(`[WhatsAppWorker] Erro na tentativa ${attempt} para ${msg.id}: ${err.message}`);
            }
          }

        } catch (err: any) {
          // Task 5: DO NOT RETRY SENT MESSAGES (Done via handleProcessingError)
          await this.handleProcessingError(msg, err);
          failureCount++;
          this.consecutiveFailures++;
        }
      }

      // 4. Métricas da Rodada
      const totalLatency = Date.now() - startTime;
      console.log(JSON.stringify({
        service: 'whatsapp-worker',
        event: 'batch_summary',
        total_processed: messages.length,
        success_count: successCount,
        failure_count: failureCount,
        avg_latency_ms: messages.length > 0 ? totalLatency / messages.length : 0,
        timestamp: new Date().toISOString()
      }));

    } catch (err: any) {
      console.error('[WhatsAppWorker] Erro catastrófico no worker:', err.message);
    }
  }

  /**
   * Task 1 & 5: Garante delay entre mensagens globais e por usuário.
   */
  private async enforceRateLimit(phone: string) {
    const now = Date.now();
    const lastUserSend = this.lastSentPerUser.get(phone) || 0;
    const timeSinceLastUserSend = now - lastUserSend;

    // Mínimo 2.5 segundos por usuário
    if (timeSinceLastUserSend < 2500) {
      const wait = 2500 - timeSinceLastUserSend;
      await new Promise(resolve => setTimeout(resolve, wait));
    } else {
      // Mínimo 1 segundo global entre mensagens
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Destrava mensagens que ficaram em 'processing' por muito tempo.
   */
  private async unlockExpiredMessages() {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() - this.lockTimeoutMinutes);

    const { error } = await supabase
      .from('whatsapp_messages')
      .update({ status: 'pending', locked_at: null })
      .eq('status', 'processing')
      .lt('locked_at', expirationDate.toISOString());

    if (error) console.error('[WhatsAppWorker] Erro ao destravar mensagens expiradas:', error.message);
  }

  /**
   * Chama a função RPC no Supabase para pegar o lote com 'SKIP LOCKED'.
   */
  private async claimBatch() {
    const { data, error } = await supabase.rpc('claim_whatsapp_messages', { 
      batch_limit: this.batchSize 
    });

    if (error) {
      console.error('[WhatsAppWorker] Erro ao realizar claim_whatsapp_messages:', error.message);
      return [];
    }

    return data;
  }

  /**
   * Atualiza o status final da mensagem.
   */
  private async updateStatus(id: string, status: 'sent' | 'failed', error?: string) {
    await supabase
      .from('whatsapp_messages')
      .update({ 
        status, 
        error: error || null, 
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        locked_at: null 
      })
      .eq('id', id);
  }

  /**
   * Lógica de tratamento de erro e retentativas seguras.
   */
  private async handleProcessingError(msg: any, err: any) {
    // Task 6: PREVENT DUPLICATE RETRY
    // Antes de tentar re-enfileirar, verificamos o status atual no banco
    const { data: currentMsg } = await supabase
      .from('whatsapp_messages')
      .select('status')
      .eq('id', msg.id)
      .single();

    if (currentMsg?.status === 'sent') {
      console.log(`[WhatsAppWorker] Abortando tratamento de erro para ${msg.id}: Mensagem já consta como enviada.`);
      return;
    }

    const isRetryable = this.isRetryableError(err);
    const canRetry = msg.retry_count < 3; // Aumentado para 3 conforme Task 2 da solicitação anterior

    if (isRetryable && canRetry) {
      const nextRetry = msg.retry_count + 1;
      console.warn(`[WhatsAppWorker] Falha recuperável na mensagem ${msg.id}. Retentativa #${nextRetry}.`);
      
      await supabase
        .from('whatsapp_messages')
        .update({ 
          status: 'pending', 
          retry_count: nextRetry,
          last_retry_at: new Date().toISOString(),
          error: `Retry ${nextRetry}: ${err.message}`,
          locked_at: null 
        })
        .eq('id', msg.id)
        .eq('status', 'processing'); // Só volta para pending se ainda estivermos com o lock
    } else {
      console.error(`[WhatsAppWorker] Falha definitiva na mensagem ${msg.id}: ${err.message}`);
      await this.updateStatus(msg.id, 'failed', err.message);
    }
  }

  /**
   * Erros que permitem retentativa (Rede, Timeout, 5xx).
   */
  private isRetryableError(err: any): boolean {
    const message = err.message.toLowerCase();
    return (
      err.name === 'TypeError' || 
      err.name === 'AbortError' || 
      message.includes('timeout') ||
      message.includes('500') ||
      message.includes('server error')
    );
  }
}
