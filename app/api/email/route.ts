import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();

  const { nome, email, telefone, data } = body;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'vitor9998@gmail.com',
      subject: 'Novo agendamento',
      html: `
        <h1>Novo agendamento</h1>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${telefone}</p>
        <p><strong>Data:</strong> ${data}</p>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error });
  }
}