import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { id, answers } = await req.json();

    if (!id || !answers) {
      return NextResponse.json({ error: "Faltam parâmetros." }, { status: 400 });
    }

    // Logic to calculate the proposal
    let score = 0;
    if (answers.chatbot) score += 1;
    if (answers.resumo_ia) score += 1;
    if (answers.solicitar_exames) score += 1;
    if (answers.mensagens_personalizadas) score += 1;

    let planName = "Plano Essencial";
    let price = "R$ 297,00/mês";
    let setupFee = "R$ 500,00";
    let features = [
      "Agenda inteligente",
      "Prontuário eletrônico",
      "Página de agendamento online"
    ];

    if (score >= 3) {
      planName = "Plano Premium";
      price = "R$ 697,00/mês";
      setupFee = "R$ 1.500,00";
      features = [
        ...features,
        "Confirmação automática via IA",
        "Resumo de anamnese inteligente",
        "Solicitação de exames automática",
        "Mensagens 100% personalizadas",
        `Suporte para ${answers.qtd_medicos} médicos e ${answers.qtd_secretarias} secretárias`
      ];
    } else if (score >= 1) {
      planName = "Plano Intermediário";
      price = "R$ 497,00/mês";
      setupFee = "R$ 900,00";
      features = [
        ...features,
        "Confirmação automática via WhatsApp",
        "Lembretes de consulta",
        `Suporte para ${answers.qtd_medicos} médicos`
      ];
    }

    const proposal = {
      planName,
      price,
      setupFee,
      features
    };

    // Update the database
    const { error } = await supabase
      .from("doctor_onboarding")
      .update({
        answers,
        proposal,
        status: "proposta_enviada",
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send proposal via WhatsApp/Email here
    // "Dr(a). [Nome], analisamos suas respostas e montamos uma proposta..."

    return NextResponse.json({ success: true, proposal });
    
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
