import { NextRequest, NextResponse } from "next/server";
import { agendaAgent } from "@/lib/agents/agendaAgent";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Validação básica
    if (!payload.nome || !payload.data || !payload.hora || !payload.user_id) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes (nome, data, hora, user_id)" },
        { status: 400 }
      );
    }

    const result = await agendaAgent("criar", payload);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API-Agenda-Create] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
