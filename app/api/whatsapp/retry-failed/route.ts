import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

/**
 * Endpoint manual para resetar mensagens que falharam e tentar novamente.
 * Move o status de 'failed' para 'pending' e reseta o contador de retentativas.
 */

export async function POST(req: Request) {
  try {
    const { messageId } = await req.json().catch(() => ({}));

    let query = supabase
      .from('whatsapp_messages')
      .update({ 
        status: 'pending', 
        retry_count: 0,
        error: null,
        locked_at: null 
      })
      .eq('status', 'failed');

    // Se um ID específico for fornecido, reseta apenas ele.
    // Caso contrário, reseta todas as falhas.
    if (messageId) {
      query = query.eq('id', messageId);
    }

    const { data, error, count } = await query.select();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0,
      message: `${data?.length || 0} mensagens foram retornadas para a fila de processamento.`
    });

  } catch (err: any) {
    console.error('[WhatsApp Retry] Erro ao resetar falhas:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
