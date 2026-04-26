import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { parseReschedule } from '@/lib/ai/whatsappParser';
import { agendaAgent } from '@/lib/agents/agendaAgent';

/**
 * Webhook avançado para processar conversas de WhatsApp.
 * Gerencia Confirmação, Cancelamento e Reagendamento Inteligente.
 */

const whatsappService = new WhatsAppService();
const QUESTION_RESCHEDULE = 'Sem problemas! Qual dia e horário você prefere?';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.event !== 'messages.upsert') {
      return NextResponse.json({ status: 'ignored_event' });
    }

    const messageData = body.data;
    if (!messageData || messageData.key.fromMe) {
      return NextResponse.json({ status: 'ignored_own_message' });
    }

    const remoteJid = messageData.key.remoteJid;
    const phone = remoteJid.split('@')[0];
    const text = messageData.message?.conversation || 
                 messageData.message?.extendedTextMessage?.text || 
                 "";

    const normalizedText = text.trim().toUpperCase();
    console.log(`[WhatsApp Webhook] Mensagem de ${phone}: "${normalizedText}"`);

    // --- 1. LÓGICA DE CONFIRMAÇÃO / CANCELAMENTO ---
    const confirmKeywords = ['SIM', 'CONFIRMAR', 'OK', 'VOU', 'CONCORDO'];
    const cancelKeywords = ['NÃO', 'NAO', 'CANCELAR', 'DESISTIR'];
    
    if (confirmKeywords.some(k => normalizedText.includes(k))) {
      return await handleStatusUpdate(phone, 'confirmado', 'Perfeito! Sua presença foi confirmada. Te esperamos 😊');
    }

    if (cancelKeywords.some(k => normalizedText.includes(k))) {
      return await handleStatusUpdate(phone, 'cancelado', 'Sem problemas! Sua consulta foi cancelada. Se precisar reagendar, estamos à disposição.');
    }

    // --- 2. LÓGICA DE REAGENDAMENTO ---
    const rescheduleKeywords = ['REMARCAR', 'NÃO POSSO', 'NAO POSSO', 'OUTRO HORÁRIO', 'MUDAR', 'TROCAR', 'OUTRO DIA'];
    
    // Verifica se é uma intenção explícita de remarcar ou uma resposta à pergunta anterior
    const { data: lastMessages } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('message')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    const isReplyingToReschedule = lastMessages && lastMessages[0]?.message === QUESTION_RESCHEDULE;
    const hasRescheduleIntent = rescheduleKeywords.some(k => normalizedText.includes(k));

    if (hasRescheduleIntent || isReplyingToReschedule) {
      // Tentar extrair data e hora via IA
      const { data: newDate, hora: newTime } = await parseReschedule(text);

      if (newDate && newTime) {
        // Encontrou data e hora! Tentar reagendar via Agent
        try {
          const appointment = await findUpcomingAppointment(phone);
          if (!appointment) {
            await whatsappService.queueMessage(phone, 'Não encontrei nenhum agendamento pendente para reagendar. Como posso ajudar?');
            return NextResponse.json({ status: 'no_appointment_found' });
          }

          // Chama o Agent para verificar disponibilidade e reagendar
          const result = await agendaAgent('reagendar', {
            id: appointment.id,
            novaData: newDate,
            novaHora: newTime
          });

          const dataFormatada = newDate.split('-').reverse().join('/');
          await whatsappService.queueMessage(phone, `Feito! Sua consulta foi reagendada para ${dataFormatada} às ${newTime}. Até lá!`);
          
          return NextResponse.json({ success: true, action: 'rescheduled' });

        } catch (err: any) {
          // Erro de disponibilidade ou outro
          await whatsappService.queueMessage(phone, `Desculpe, esse horário não está disponível. Poderia sugerir outro dia ou horário?`);
          return NextResponse.json({ success: true, action: 'reschedule_conflict' });
        }
      } else {
        // Não encontrou data/hora na mensagem, pergunta ao paciente
        await whatsappService.queueMessage(phone, QUESTION_RESCHEDULE);
        return NextResponse.json({ success: true, action: 'asked_reschedule_details' });
      }
    }

    return NextResponse.json({ success: true, status: 'no_intent_matched' });

  } catch (err: any) {
    console.error('[WhatsApp Webhook] Erro crítico:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * Auxiliar para atualizar status de agendamento e responder.
 */
async function handleStatusUpdate(phone: string, status: string, reply: string) {
  const appointment = await findUpcomingAppointment(phone);
  if (appointment) {
    await supabaseAdmin.from('agendamentos').update({ status }).eq('id', appointment.id);
    await whatsappService.queueMessage(phone, reply, `reply-${appointment.id}-${status}`);
    return NextResponse.json({ success: true, action: `updated_${status}` });
  }
  return NextResponse.json({ success: true, status: 'no_appointment_found' });
}

/**
 * Busca o agendamento mais próximo para um telefone.
 */
async function findUpcomingAppointment(phone: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabaseAdmin
    .from('agendamentos')
    .select('id, data, hora')
    .or(`telefone.eq.${phone},phone.eq.${phone}`)
    .gte('data', today)
    .neq('status', 'cancelado')
    .order('data', { ascending: true })
    .limit(1)
    .maybeSingle();
  
  return data;
}
