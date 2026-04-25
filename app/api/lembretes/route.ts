import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { buildMensagemLembrete } from '@/lib/communication';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { pendentes, sandboxEmail } = await req.json();

    if (!pendentes || pendentes.length === 0) {
      return NextResponse.json({ error: 'Nenhum agendamento fornecido' }, { status: 400 });
    }

    const resultados = [];

    for (const c of pendentes) {
      const canal = c.canal_utilizado || "email";
      const mensagem = buildMensagemLembrete(c);
      
      console.log(`[API-Lembretes] Processando: Paciente=${c.nome}, Canal=${canal}, Sandbox=${!!sandboxEmail}`);

      if (canal === "email") {
        const targetEmail = sandboxEmail || c.email;
        if (!targetEmail) {
          console.log(`[API-Lembretes] Pulando: Paciente=${c.nome} (Sem e-mail)`);
          resultados.push({ id: c.id, status: "sem_email", canal: "email" });
          continue;
        }

        try {
          await resend.emails.send({
            from: 'MedFlow Lembretes <onboarding@resend.dev>',
            to: targetEmail,
            subject: 'Lembrete de Consulta',
            html: `<p>${mensagem.replace(/\n/g, '<br>')}</p>`
          });
          resultados.push({ id: c.id, status: "enviado", canal: "email" });
        } catch (e) {
          console.error(`Erro Resend para ${c.nome}:`, e);
          resultados.push({ id: c.id, status: "falha", canal: "email" });
        }
      } else if (canal === "whatsapp") {
        // MOCK WhatsApp
        console.log(`[WHATSAPP MOCK] Para: ${c.telefone} | Msg: ${mensagem}`);
        resultados.push({ id: c.id, status: "enviado", canal: "whatsapp" });
      } else if (canal === "sms") {
        // MOCK SMS
        console.log(`[SMS MOCK] Para: ${c.telefone} | Msg: ${mensagem}`);
        resultados.push({ id: c.id, status: "enviado", canal: "sms" });
      }
    }

    return NextResponse.json({ success: true, resultados });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
