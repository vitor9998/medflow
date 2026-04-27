import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { WhatsAppService } from '@/lib/services/whatsappService';

/**
 * Endpoint de Cron para envio automático de lembretes de consultas.
 * Regra: Busca consultas para o dia seguinte que ainda não receberam lembrete.
 * Planejado para rodar via Vercel Cron ou GitHub Actions.
 */

const whatsappService = new WhatsAppService();

export async function GET(req: Request) {
  try {
    // 1. Verificação de Segurança (CRON_SECRET)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Determinar a data de amanhã (Fuso Horário Local / Brasil)
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    // Converte para YYYY-MM-DD no fuso de SP
    const tomorrowStr = tomorrow.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      .split('/')
      .reverse()
      .join('-');

    console.log(`[Reminders] Buscando consultas para amanhã (${tomorrowStr})...`);

    // 3. Buscar agendamentos que precisam de lembrete
    // Filtros: data de amanhã, lembrete ainda não enviado e status não cancelado
    const { data: appointments, error } = await supabaseAdmin
      .from('agendamentos')
      .select('*')
      .eq('data', tomorrowStr)
      .eq('lembrete_enviado', false)
      .in('status', ['pendente', 'confirmado']);

    if (error) {
      throw new Error(`Erro ao buscar agendamentos: ${error.message}`);
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'Nenhum lembrete pendente para processar.' 
      });
    }

    let successCount = 0;
    const failures = [];

    // 4. Processar cada lembrete
    for (const appt of appointments) {
      try {
        const phone = appt.telefone || appt.phone;
        
        if (!phone) {
          console.warn(`[Reminders] Agendamento ${appt.id} ignorado por falta de telefone.`);
          continue;
        }

        // Construção da mensagem amigável
        const message = `Olá ${appt.nome}, aqui é da Medflow! Passando para lembrar da sua consulta AMANHÃ (${tomorrow.toLocaleDateString('pt-BR')}) às ${appt.hora}. Podemos confirmar sua presença?`;
        
        // Chave de idempotência para evitar envios duplicados em caso de retentativa do Cron
        const idempotencyKey = `reminder-auto-${appt.id}`;

        // Enfileira a mensagem no sistema de WhatsApp
        const result = await whatsappService.queueMessage(phone, message, idempotencyKey);

        if (result.success) {
          // Marca o agendamento como 'lembrete enviado' para não processar novamente
          const { error: updateError } = await supabaseAdmin
            .from('agendamentos')
            .update({ lembrete_enviado: true })
            .eq('id', appt.id);

          if (updateError) {
            console.error(`[Reminders] Erro ao atualizar flag lembrete_enviado para ID ${appt.id}:`, updateError.message);
          } else {
            successCount++;
          }
        }
      } catch (err: any) {
        failures.push({ id: appt.id, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      date_processed: tomorrowStr,
      total_found: appointments.length,
      success_count: successCount,
      failures: failures.length > 0 ? failures : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[Cron Reminders] Erro catastrófico:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
