import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { parseReschedule } from '@/lib/ai/whatsappParser';
import { agendaAgent } from '@/lib/agents/agendaAgent';
import { normalizePhone } from '@/lib/utils/phone';
import { parseIntent } from '@/lib/utils/intentParser';
import { AIService } from '@/lib/services/aiService';

/**
 * Webhook avançado para processar conversas de WhatsApp.
 * Gerencia Confirmação, Cancelamento e Reagendamento Inteligente.
 */

const whatsappService = new WhatsAppService();
const aiService = new AIService();
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
    const phone = normalizePhone(remoteJid.split('@')[0]);
    const text = messageData.message?.conversation || 
                 messageData.message?.extendedTextMessage?.text || 
                 "";

    // --- 0. VALIDAÇÕES INICIAIS ---
    if (!text || text.trim().length < 2) {
      await whatsappService.queueMessage(phone, "Pode me enviar mais detalhes? 😊");
      return NextResponse.json({ status: 'message_too_short' });
    }

    if (text.length > 300) {
      await whatsappService.queueMessage(phone, "Mensagem muito longa, pode resumir? 😊");
      return NextResponse.json({ status: 'message_too_long' });
    }

    let source = "rule";
    const intent = parseIntent(text);
    
    console.log({
      phone,
      message: text,
      intent,
      source,
      timestamp: new Date().toISOString()
    });

    // --- 1. LÓGICA DE CONFIRMAÇÃO / CANCELAMENTO ---
    if (intent === 'confirmar') {
      return await handleStatusUpdate(phone, 'confirmado', 'Perfeito! Sua presença foi confirmada. Te esperamos 😊');
    }

    if (intent === 'cancelar') {
      return await handleStatusUpdate(phone, 'cancelado', 'Sem problemas! Sua consulta foi cancelada. Se precisar reagendar, estamos à disposição.');
    }

    // --- 2. LÓGICA DE REAGENDAMENTO ---
    // Verifica se é uma intenção explícita de remarcar ou uma resposta à pergunta anterior
    const { data: lastMessages } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('message')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    const isReplyingToReschedule = lastMessages && lastMessages[0]?.message === QUESTION_RESCHEDULE;
    const hasRescheduleIntent = intent === 'remarcar';

    if (hasRescheduleIntent || isReplyingToReschedule) {
      // Tentar extrair data e hora via IA
      const { data: newDate, hora: newTime } = await parseReschedule(text);

      if (newDate && newTime) {
        return await handleReschedule(phone, newDate, newTime);
      } else {
        // Não encontrou data/hora na mensagem, pergunta ao paciente
        await whatsappService.queueMessage(phone, QUESTION_RESCHEDULE);
        return NextResponse.json({ success: true, action: 'asked_reschedule_details' });
      }
    }

    // --- 3. LÓGICA DE INTELIGÊNCIA ARTIFICIAL (FALLBACK) ---
    // Se chegamos aqui, o parser de regras não identificou a intenção.
    // Chamamos a OpenAI para lidar com a conversa de forma natural.
    const appointment = await findUpcomingAppointment(phone);
    
    if (appointment) {
      const aiContext = {
        paciente_nome: appointment.nome,
        medico_nome: appointment.profiles?.nome,
        especialidade: appointment.profiles?.especialidade,
        data: appointment.data,
        hora: appointment.hora
      };

      const aiResult = await aiService.handleConversation(text, aiContext);
      const source = "ai";
      const intent = aiResult.intent;

      console.log({
        phone,
        message: text,
        intent,
        source,
        timestamp: new Date().toISOString()
      });

      // Agir com base na intenção da IA
      if (aiResult.intent === 'confirm') {
        return await handleStatusUpdate(phone, 'confirmado', aiResult.response);
      }
      
      if (aiResult.intent === 'cancel') {
        return await handleStatusUpdate(phone, 'cancelado', aiResult.response);
      }

      if (aiResult.intent === 'reschedule') {
        // Se a IA detectou que o paciente quer reagendar, podemos usar a resposta dela
        // ou disparar o fluxo de perguntas de reagendamento.
        await whatsappService.queueMessage(phone, aiResult.response);
        return NextResponse.json({ success: true, action: 'ai_reschedule_flow' });
      }

      // Se for uma pergunta ou desconhecido, apenas enviamos a resposta da IA
      await whatsappService.queueMessage(phone, aiResult.response);
      return NextResponse.json({ success: true, action: 'ai_replied', intent: aiResult.intent });
    } else {
      // Caso não tenha agendamento, fallback de segurança
      await whatsappService.queueMessage(phone, "Desculpe, não consegui entender agora. Pode reformular? 😊");
      return NextResponse.json({ success: true, action: 'fallback_no_context' });
    }

    return NextResponse.json({ success: true, status: 'no_intent_matched' });

  } catch (err: any) {
    console.error('[WhatsApp Webhook] Erro crítico:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * Auxiliar para atualizar status de agendamento e responder de forma segura.
 * Garante que agendamentos já processados não sejam duplicados.
 */
async function handleStatusUpdate(phone: string, newStatus: string, reply: string) {
  const appointment = await findUpcomingAppointment(phone);
  
  if (!appointment) {
    return NextResponse.json({ success: true, status: 'no_appointment_found' });
  }

  const previousStatus = appointment.status;

  // --- 1. BLOQUEIO DE DUPLICIDADE ---
  // Só permitimos transição a partir do estado 'pending'
  if (previousStatus !== 'pending') {
    console.log({
      appointmentId: appointment.id,
      previousStatus,
      attemptedAction: newStatus,
      result: "skipped",
      reason: "already_processed"
    });
    
    return NextResponse.json({ 
      success: true, 
      action: 'skipped_already_processed',
      currentStatus: previousStatus 
    });
  }

  // --- 2. ATUALIZAÇÃO CONDICIONAL (ATÔMICA) ---
  const { error, count } = await supabaseAdmin
    .from('agendamentos')
    .update({ status: newStatus })
    .eq('id', appointment.id)
    .eq('status', 'pending') // Garantia extra de concorrência
    .select();

  if (error || !count) {
    console.warn(`[Webhook] Falha ao atualizar status ou já atualizado por outro processo.`);
    return NextResponse.json({ success: false, error: 'update_failed_or_concurrency_issue' });
  }

  // --- 3. ENVIO DE MENSAGEM (SÓ SE ATUALIZOU) ---
  await whatsappService.queueMessage(phone, reply, `reply-${appointment.id}-${newStatus}`);

  console.log({
    appointmentId: appointment.id,
    previousStatus,
    attemptedAction: newStatus,
    result: "updated",
    timestamp: new Date().toISOString()
  });

  return NextResponse.json({ success: true, action: `updated_to_${newStatus}` });
}

/**
 * Auxiliar para reagendamento seguro e idempotente.
 */
async function handleReschedule(phone: string, newDate: string, newTime: string) {
  const appointment = await findUpcomingAppointment(phone);
  
  if (!appointment) {
    await whatsappService.queueMessage(phone, 'Não encontrei nenhum agendamento pendente para reagendar. Como posso ajudar?');
    return NextResponse.json({ status: 'no_appointment_found' });
  }

  // --- 1. VALIDAÇÃO DE STATUS ---
  if (appointment.status === 'cancelado') {
    await whatsappService.queueMessage(phone, 'Essa consulta já foi cancelada. Se quiser, posso te ajudar a agendar uma nova 😊');
    return NextResponse.json({ success: true, action: 'reschedule_denied_cancelled' });
  }

  // --- 2. VALIDAÇÃO DE MESMO HORÁRIO (IDEMPOTÊNCIA) ---
  if (appointment.data === newDate && appointment.hora === newTime) {
    await whatsappService.queueMessage(phone, 'Esse já é o horário atual da sua consulta 😊');
    console.log({
      appointmentId: appointment.id,
      action: "reschedule",
      result: "skipped",
      reason: "same_slot"
    });
    return NextResponse.json({ success: true, action: 'reschedule_skipped_same_slot' });
  }

  // --- 3. EXECUÇÃO VIA AGENT (COM VALIDAÇÃO DE DISPONIBILIDADE) ---
  try {
    await agendaAgent('reagendar', {
      id: appointment.id,
      novaData: newDate,
      novaHora: newTime
    });

    const dataFormatada = newDate.split('-').reverse().join('/');
    await whatsappService.queueMessage(phone, `Feito! Sua consulta foi reagendada para ${dataFormatada} às ${newTime}. Até lá!`);

    console.log({
      appointmentId: appointment.id,
      previousDate: appointment.data,
      previousTime: appointment.hora,
      newDate,
      newTime,
      action: "reschedule",
      result: "updated",
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ success: true, action: 'rescheduled' });

  } catch (err: any) {
    // Erro de disponibilidade ou outro
    await whatsappService.queueMessage(phone, `Desculpe, esse horário não está disponível. Poderia sugerir outro dia ou horário?`);
    return NextResponse.json({ success: true, action: 'reschedule_conflict' });
  }
}

/**
 * Busca o agendamento mais próximo para um telefone.
 */
async function findUpcomingAppointment(phone: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabaseAdmin
    .from('agendamentos')
    .select('id, data, hora, nome, status, user_id, profiles(nome, especialidade)')
    .or(`telefone.eq.${normalizePhone(phone)},phone.eq.${normalizePhone(phone)}`)
    .gte('data', today)
    .neq('status', 'cancelado')
    .order('data', { ascending: true })
    .limit(1)
    .maybeSingle();
  
  return data as any;
}
