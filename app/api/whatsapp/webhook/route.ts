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
const MULTIPLE_APPOINTMENTS_MSG = 'Você possui mais de uma consulta agendada:';

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

    // --- 1.5 MEMÓRIA CONVERSACIONAL (Seleção de Múltiplos) ---
    const { data: lastMessagesForSelection } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('message, status')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(5);

    const lastBotMsg = lastMessagesForSelection?.find(m => m.message.includes(MULTIPLE_APPOINTMENTS_MSG))?.message;

    if (lastBotMsg) {
      const selectionIndex = parseSelection(text);
      if (selectionIndex !== null) {
        console.log(`🎯 Seleção detectada: ${selectionIndex + 1}`);
        const appointments = await findUpcomingAppointments(phone);
        
        if (appointments[selectionIndex]) {
          const selected = appointments[selectionIndex];
          const action = lastBotMsg.includes('cancelar') ? 'cancelado' : 
                         lastBotMsg.includes('confirmar') ? 'confirmado' : 'reagendar';
          
          if (action === 'reagendar') {
            // Para reagendar, ainda precisamos de data/hora, mas agora sabemos QUAL consulta
            // Por simplicidade, vamos deixar a IA lidar com isso agora que o contexto está limpo
          } else {
            return await handleStatusUpdate(phone, action, 
              action === 'confirmado' ? 'Perfeito! Sua presença foi confirmada. Te esperamos 😊' : 'Sem problemas! Sua consulta foi cancelada.', 
              phone, text, selected.id);
          }
        }
      } else if (text.length < 5 || /^\d+$/.test(text.trim())) {
        await sendImmediate(phone, "Não entendi qual opção você escolheu. Por favor, use os números (1, 2...) ou diga 'a primeira', 'a segunda'.");
        return NextResponse.json({ success: true, action: 'selection_retry' });
      }
    }

    // --- PREVENÇÃO DE LOOP ---
    // Ignorar mensagens que contenham respostas padrão do bot para evitar ciclos infinitos
    const botPhrases = [
      QUESTION_RESCHEDULE,
      MULTIPLE_APPOINTMENTS_MSG,
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
      return await handleStatusUpdate(phone, 'confirmado', 'Perfeito! Sua presença foi confirmada. Te esperamos 😊', phone, text);
    }

    if (intent === 'cancelar') {
      return await handleStatusUpdate(phone, 'cancelado', 'Sem problemas! Sua consulta foi cancelada. Se precisar reagendar, estamos à disposição.', phone, text);
    }

    // --- 3. LÓGICA DE REAGENDAMENTO ---
    const { data: lastMessagesForReschedule } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('message')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    const isReplyingToReschedule = lastMessagesForReschedule && lastMessagesForReschedule[0]?.message === QUESTION_RESCHEDULE;
    
    if (intent === 'remarcar' || isReplyingToReschedule) {
      try {
        const { data: newDate, hora: newTime } = await parseReschedule(text);
        if (newDate && newTime) {
          return await handleReschedule(phone, newDate, newTime, phone, text);
        } else {
          await sendImmediate(phone, QUESTION_RESCHEDULE);
          return NextResponse.json({ success: true, action: 'asked_reschedule_details' });
        }
      } catch (e) {
        console.warn("[Webhook] Falha no parseReschedule, continuando para IA...");
      }
    }

    // --- 4. FALLBACK INTELIGENTE (OpenAI) ---
    const appointments = await findUpcomingAppointments(phone);
    
    if (appointments.length > 0) {
      const aiContext = {
        appointments: appointments,
        paciente_nome: appointments[0].nome
      };

      const aiResult = await aiService.handleConversation(text, aiContext);
      
      if (aiResult.intent === 'confirm') return await handleStatusUpdate(phone, 'confirmado', aiResult.response, phone, text);
      if (aiResult.intent === 'cancel') return await handleStatusUpdate(phone, 'cancelado', aiResult.response, phone, text);
      
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

// Auxiliar para identificar seleções (1, primeira, etc)
function parseSelection(text: string): number | null {
  const normalized = text.toLowerCase().trim();
  
  if (normalized === "1" || normalized.includes("primeira") || normalized.includes("de cima") || normalized.includes("mais proxima") || normalized.includes("mais próxima")) return 0;
  if (normalized === "2" || normalized.includes("segunda") || normalized.includes("de baixo")) return 1;
  if (normalized === "3" || normalized.includes("terceira")) return 2;
  
  const match = normalized.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (num > 0 && num <= 5) return num - 1;
  }
  
  return null;
}

// Funções Auxiliares com Envio para o Telefone de Origem
async function sendImmediate(phoneNumber: string, text: string) {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  console.log(`📤 ENVIANDO PARA: ${phoneNumber}`);
  
  // Logar mensagem enviada no banco para contexto conversacional
  await supabaseAdmin
    .from('whatsapp_messages')
    .insert([{ phone: phoneNumber, message: text, status: 'sent' }]);

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

async function handleStatusUpdate(phone: string, newStatus: string, reply: string, destinationNumber: string, originalText?: string, specificId?: string) {
  const appointments = await findUpcomingAppointments(phone);
  
  if (appointments.length === 0) {
    await sendImmediate(destinationNumber, "Desculpe, não encontrei nenhuma consulta pendente para este número.");
    return NextResponse.json({ success: true, status: 'no_appointment_found' });
  }

  let appointment = specificId ? appointments.find(a => a.id === specificId) : null;

  if (!appointment) {
    if (appointments.length > 1) {
      // Tenta encontrar uma consulta específica mencionada no texto
      const matched = appointments.find((a: any) => {
        const dateStr = a.data.split('-').reverse().join('/'); // DD/MM/YYYY
        const day = a.data.split('-')[2]; // DD
        return originalText?.includes(dateStr) || originalText?.includes(`dia ${day}`);
      });

      if (matched) {
        appointment = matched;
      } else {
        const list = appointments.map((a: any, i: number) => 
          `${i + 1}. ${a.data.split('-').reverse().join('/')} às ${a.hora}`
        ).join('\n');
        
        await sendImmediate(destinationNumber, `${MULTIPLE_APPOINTMENTS_MSG}\n\n${list}\n\nQual delas você deseja ${newStatus === 'confirmado' ? 'confirmar' : 'cancelar'}?\n(Responda 1, 2, "a primeira", etc.)`);
        return NextResponse.json({ success: true, action: 'ambiguity_detected' });
      }
    } else {
      appointment = appointments[0];
    }
  }

  await supabaseAdmin
    .from('agendamentos')
    .update({ status: newStatus })
    .eq('id', appointment.id);

  await sendImmediate(destinationNumber, reply);
  return NextResponse.json({ success: true, action: `updated_to_${newStatus}` });
}

async function handleReschedule(phone: string, newDate: string, newTime: string, destinationNumber: string, originalText?: string, specificId?: string) {
  const appointments = await findUpcomingAppointments(phone);
  
  if (appointments.length === 0) return NextResponse.json({ status: 'no_appt' });

  let appointment = specificId ? appointments.find(a => a.id === specificId) : null;

  if (!appointment) {
    if (appointments.length > 1) {
      // Tenta encontrar uma consulta específica mencionada no texto (ex: "reagendar a do dia 10")
      const matched = appointments.find((a: any) => {
        const day = a.data.split('-')[2];
        return originalText?.includes(`dia ${day}`) || originalText?.includes(a.data.split('-').reverse().join('/'));
      });

      if (matched) {
        appointment = matched;
      } else {
        const list = appointments.map((a: any, i: number) => 
          `${i + 1}. ${a.data.split('-').reverse().join('/')} às ${a.hora}`
        ).join('\n');
        
        await sendImmediate(destinationNumber, `${MULTIPLE_APPOINTMENTS_MSG}\n\n${list}\n\nQual delas você deseja reagendar?\n(Responda 1, 2, "a primeira", etc.)`);
        return NextResponse.json({ success: true, action: 'ambiguity_detected' });
      }
    } else {
      appointment = appointments[0];
    }
  }

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

async function findUpcomingAppointments(phone: string) {
  // Ajuste de data: Pegamos a data de "hoje" subtraindo 24h para garantir que consultas do dia atual 
  // (no fuso do Brasil) não sejam filtradas por causa do UTC do servidor.
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const dateFilter = yesterdayDate.toISOString().split('T')[0];
  
  const cleaned = phone.replace(/\D/g, "");
  const last10 = cleaned.slice(-10);

  console.log(`🔍 Buscando consultas para fone: ${cleaned} (Pattern: %${last10}%, Data >= ${dateFilter})`);

  const { data, error } = await supabaseAdmin
    .from('agendamentos')
    .select('id, data, hora, nome, status, profiles(nome, especialidade)')
    .ilike('telefone', `%${last10}%`)
    .gte('data', dateFilter)
    .neq('status', 'cancelado')
    .order('data', { ascending: true });
    
  if (error) {
    console.error(`❌ Erro na busca de agendamentos:`, error);
  }

  console.log(`📊 Consultas encontradas: ${data?.length || 0}`);
  return data || [];
}
