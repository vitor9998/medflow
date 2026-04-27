import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { parseReschedule } from '@/lib/ai/whatsappParser';
import { agendaAgent } from '@/lib/agents/agendaAgent';
import { normalizePhone, isValidBrazilPhone } from '@/lib/utils/phone';
import { parseIntent } from '@/lib/utils/intentParser';
import { AIService } from '@/lib/services/aiService';

const whatsappService = new WhatsAppService();
const aiService = new AIService();
const QUESTION_RESCHEDULE = 'Sem problemas! Qual dia e horário você prefere?';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[Webhook WhatsApp] Payload recebido:", JSON.stringify(body, null, 2));

    // 1. Extração de Dados
    const data = body?.data || body?.messages?.[0];
    
    if (!data) {
      return NextResponse.json({ status: 'ignored_no_data' });
    }

    const fromMe = data?.key?.fromMe;
    const sender = body?.sender || data?.key?.remoteJid;
    const phone = normalizePhone(sender?.split('@')[0] || "");

    if (!isValidBrazilPhone(phone)) {
      console.warn("⚠️ Telefone inválido recebido no webhook:", phone);
      return NextResponse.json({ status: 'ignored_invalid_phone' });
    }

    if (fromMe && process.env.ALLOW_SELF_TEST !== "true") {
      console.log("⛔ Ignorando mensagem própria (produção)");
      return NextResponse.json({ status: "ignored_own_message" });
    }

    if (fromMe && process.env.ALLOW_SELF_TEST === "true") {
      console.log("⚠️ Modo teste ativo: processando mensagem própria");
    }

    // O sender (quem enviou) pode vir no payload da Evolution
    // const phone já foi extraído acima

    const msgContent = data?.message;
    const text = 
      msgContent?.conversation || 
      msgContent?.extendedTextMessage?.text || 
      msgContent?.imageMessage?.caption || 
      "";

    if (!text || text.trim().length < 1) {
      return NextResponse.json({ status: 'ignored_empty_message' });
    }

    // --- PREVENÇÃO DE LOOP ---
    // Ignorar mensagens que contenham respostas padrão do bot para evitar ciclos infinitos
    const botPhrases = [
      QUESTION_RESCHEDULE,
      "Sua presença foi confirmada",
      "Sua consulta foi cancelada",
      "Consulta reagendada para",
      "horário não está disponível",
      "Não encontrei uma consulta agendada",
      "não encontrei nenhuma consulta pendente"
    ];

    if (botPhrases.some(phrase => text.includes(phrase))) {
      console.log("🤖 Ignorando mensagem gerada pelo próprio bot para evitar loop");
      return NextResponse.json({ status: 'ignored_bot_loop' });
    }

    console.log(`[Webhook WhatsApp] Processando - Fone: ${phone}, Texto: "${text}"`);

    // --- 2. LÓGICA DE INTENÇÕES ---
    const intent = parseIntent(text);

    if (intent === 'confirmar') {
      return await handleStatusUpdate(phone, 'confirmado', 'Perfeito! Sua presença foi confirmada. Te esperamos 😊', phone);
    }

    if (intent === 'cancelar') {
      return await handleStatusUpdate(phone, 'cancelado', 'Sem problemas! Sua consulta foi cancelada. Se precisar reagendar, estamos à disposição.', phone);
    }

    // --- 3. LÓGICA DE REAGENDAMENTO ---
    const { data: lastMessages } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('message')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    const isReplyingToReschedule = lastMessages && lastMessages[0]?.message === QUESTION_RESCHEDULE;
    
    if (intent === 'remarcar' || isReplyingToReschedule) {
      try {
        const { data: newDate, hora: newTime } = await parseReschedule(text);
        if (newDate && newTime) {
          return await handleReschedule(phone, newDate, newTime, phone);
        } else {
          await sendImmediate(phone, QUESTION_RESCHEDULE);
          return NextResponse.json({ success: true, action: 'asked_reschedule_details' });
        }
      } catch (e) {
        console.warn("[Webhook] Falha no parseReschedule, continuando para IA...");
      }
    }

    // --- 4. FALLBACK INTELIGENTE (OpenAI) ---
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
      
      if (aiResult.intent === 'confirm') return await handleStatusUpdate(phone, 'confirmado', aiResult.response, phone);
      if (aiResult.intent === 'cancel') return await handleStatusUpdate(phone, 'cancelado', aiResult.response, phone);
      
      await sendImmediate(phone, aiResult.response);
      return NextResponse.json({ success: true, action: 'ai_handled', intent: aiResult.intent });
    } else {
      console.log(`[Webhook] Nenhuma consulta encontrada para o fone: ${phone}`);
      await sendImmediate(phone, "Olá! Não encontrei uma consulta agendada para este número no momento. Como posso te ajudar?");
      return NextResponse.json({ status: 'no_appointment_found' });
    }

  } catch (err: any) {
    console.error('[WhatsApp Webhook] Erro crítico:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 200 });
  }
}

// Funções Auxiliares com Envio para o Telefone de Origem
async function sendImmediate(phoneNumber: string, text: string) {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  console.log(`📤 ENVIANDO PARA: ${phoneNumber}`);
  
  try {
    const response = await fetch(`${url}/message/sendText/${instance}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "apikey": key || "" },
      body: JSON.stringify({
        number: phoneNumber,
        textMessage: { text }
      })
    });
    
    const resData = await response.text();
    console.log("📡 Resposta da Evolution:", resData);
  } catch (err) {
    console.error("❌ Falha no envio imediato:", err);
  }
}

async function handleStatusUpdate(phone: string, newStatus: string, reply: string, destinationNumber: string) {
  const appointment = await findUpcomingAppointment(phone);
  if (!appointment) {
    await sendImmediate(destinationNumber, "Desculpe, não encontrei nenhuma consulta pendente para este número.");
    return NextResponse.json({ success: true, status: 'no_appointment_found' });
  }

  await supabaseAdmin
    .from('agendamentos')
    .update({ status: newStatus })
    .eq('id', appointment.id);

  await sendImmediate(destinationNumber, reply);
  return NextResponse.json({ success: true, action: `updated_to_${newStatus}` });
}

async function handleReschedule(phone: string, newDate: string, newTime: string, destinationNumber: string) {
  const appointment = await findUpcomingAppointment(phone);
  if (!appointment) return NextResponse.json({ status: 'no_appt' });

  try {
    await agendaAgent('reagendar', { id: appointment.id, novaData: newDate, novaHora: newTime });
    const df = newDate.split('-').reverse().join('/');
    await sendImmediate(destinationNumber, `Feito! Consulta reagendada para ${df} às ${newTime}.`);
    return NextResponse.json({ success: true, action: 'rescheduled' });
  } catch (err) {
    await sendImmediate(destinationNumber, `Desculpe, esse horário não está disponível. Poderia sugerir outro?`);
    return NextResponse.json({ status: 'conflict' });
  }
}

async function findUpcomingAppointment(phone: string) {
  const today = new Date().toISOString().split('T')[0];
  
  // Pega os últimos 11 dígitos (DDD + Número) para ser seguro e evitar colisões entre estados
  const last11 = phone.slice(-11);

  const { data } = await supabaseAdmin
    .from('agendamentos')
    .select('id, data, hora, nome, status, profiles(nome, especialidade)')
    .or(`telefone.ilike.%${last11}%,phone.ilike.%${last11}%`)
    .gte('data', today)
    .neq('status', 'cancelado')
    .order('data', { ascending: true })
    .limit(1)
    .maybeSingle();
    
  return data;
}
