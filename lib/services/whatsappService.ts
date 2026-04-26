import { supabaseAdmin as supabase } from '@/lib/supabase/server';
import { formatPhone } from '@/lib/whatsapp';

/**
 * Serviço de Mensageria WhatsApp.
 * Especializado em enfileiramento e garantia de idempotência.
 */
export class WhatsAppService {
  
  /**
   * Enfileira uma mensagem no banco de dados para ser processada pelo Worker.
   * - Limpa o telefone.
   * - Garante idempotência.
   * - Salva como 'pending'.
   */
  async queueMessage(phone: string, message: string, idempotencyKey?: string) {
    const cleanPhone = formatPhone(phone);
    
    // 1. Persistência na tabela whatsapp_messages
    // O status padrão é 'pending', que será capturado pelo Worker.
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([
        { 
          phone: cleanPhone, 
          message, 
          status: 'pending', 
          idempotency_key: idempotencyKey,
          retry_count: 0
        }
      ])
      .select()
      .single();

    if (error) {
      // Erro de duplicidade (Idempotência)
      if (error.code === '23505') {
        return { 
          success: true, 
          status: 'idempotent_skipped', 
          message: 'Esta mensagem já foi enfileirada anteriormente.' 
        };
      }
      throw new Error(`Falha ao enfileirar mensagem: ${error.message}`);
    }

    // Nota: Não disparamos o processamento direto aqui para respeitar o Rate Limit do Worker.
    // O Worker capturará esta mensagem na próxima rodada.

    return { 
      success: true, 
      status: 'queued', 
      messageId: data.id 
    };
  }
}
