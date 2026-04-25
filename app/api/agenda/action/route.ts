import { NextRequest, NextResponse } from "next/server";
import { agendaAgent } from "@/lib/agents/agendaAgent";

export async function POST(req: NextRequest) {
  try {
    const { action, id } = await req.json();

    if (!action || !id) {
      return NextResponse.json(
        { error: "Action e ID são obrigatórios" },
        { status: 400 }
      );
    }

    const validActions = ["confirmar", "cancelar", "presente"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Ação inválida" },
        { status: 400 }
      );
    }

    const result = await agendaAgent(action as any, { id });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API-Agenda-Action] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
