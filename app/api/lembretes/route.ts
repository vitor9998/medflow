import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializa o cliente Resend com a chave do .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { pendentes } = await req.json();

    if (!pendentes || pendentes.length === 0) {
      return NextResponse.json({ error: 'Nenhum agendamento fornecido' }, { status: 400 });
    }

    const { enviosFormatados, emailsParaEnviar } = processarEmails(pendentes);

    let sucessoEnvio = true;

    if (emailsParaEnviar.length > 0) {
        // O Resend permite batch se enviar arrays, mas num nível simples podemos usar loop promises ou batch API custom.
        // Aqui usaremos Promise.all para enviar simultaneamente.
        const promises = emailsParaEnviar.map(email => resend.emails.send(email));
        
        await Promise.allSettled(promises);
    }

    return NextResponse.json({ success: true, message: `Lembretes processados: ${pendentes.length}` });
    
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper interno
function processarEmails(pendentes: any[]) {
    const emailsParaEnviar: any[] = [];
    const enviosFormatados: any[] = [];

    for (const c of pendentes) {
        if (c.email) {
            emailsParaEnviar.push({
                from: 'MedFlow Lembretes <onboarding@resend.dev>',
                to: c.email,
                subject: 'Lembrete de Consulta',
                html: `<p>Olá <strong>${c.nome}</strong>,</p><p>Você tem uma consulta agendada para <strong>${c.data?.split('-').reverse().join('/')} às ${c.hora}</strong>.</p><p>Até breve!</p>`
            });
        }
    }

    return { emailsParaEnviar, enviosFormatados };
}
