import { NextRequest, NextResponse } from "next/server";
import { agendaAgent } from "@/lib/agents/agendaAgent";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const result = await agendaAgent("atualizar_prontuario", payload);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API-Agenda-Record] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
