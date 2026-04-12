import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);

    const body = await req.json();

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "vitor9998@gmail.com",
      subject: "Novo agendamento",
      html: `<p>Novo agendamento recebido</p>`,
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: "Erro ao enviar email" });
  }
}