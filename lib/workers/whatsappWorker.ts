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

  /**
   * Executa uma rodada de processamento.
   */
  async run() {
    console.log('[WhatsAppWorker] Iniciando rodada de processamento...');
    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    try {
      // 1. Manutenção: Destravar mensagens presas por timeout
      await this.unlockExpiredMessages();

      // 2. Claiming: Pegar lote de forma atômica usando função PostgreSQL
      const messages = await this.claimBatch();
      
      if (!messages || messages.length === 0) {
        console.log('[WhatsAppWorker] Nenhuma mensagem pendente na fila.');
        return;
      }

      console.log(`[WhatsAppWorker] Processando lote de ${messages.length} mensagens.`);

      // 3. Processamento Individual com Rate Limit
      for (const msg of messages) {
        try {
          // Rate Limit: Espera 1 segundo entre envios para evitar bloqueios do WhatsApp
          await new Promise(resolve => setTimeout(resolve, 1000));

          const sendStartTime = Date.now();
          const normalizedPhone = normalizePhone(msg.phone);
          await this.provider.sendMessage(normalizedPhone, msg.message);
          const latency = Date.now() - sendStartTime;

          // Sucesso
          await this.updateStatus(msg.id, 'sent');
          successCount++;
          
          console.log(`[WhatsAppWorker] Mensagem ${msg.id} enviada com sucesso (${latency}ms).`);

        } catch (err: any) {
          // Falha: Gerenciar retentativa ou morte da mensagem
          await this.handleProcessingError(msg, err);
          failureCount++;
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
    const isRetryable = this.isRetryableError(err);
    const canRetry = msg.retry_count < 2;

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
        .eq('id', msg.id);
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
