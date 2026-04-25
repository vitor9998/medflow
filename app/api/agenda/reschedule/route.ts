import { NextRequest, NextResponse } from "next/server";
import { agendaAgent } from "@/lib/agents/agendaAgent";

export async function POST(req: NextRequest) {
  try {
    const { id, nova_data, nova_hora } = await req.json();

    if (!id || !nova_data || !nova_hora) {
      return NextResponse.json(
        { error: "ID, nova_data e nova_hora são obrigatórios" },
        { status: 400 }
      );
    }

    // O agent espera novaData e novaHora (camelCase no payload interno)
    const result = await agendaAgent("reagendar", { 
      id, 
      novaData: nova_data, 
      novaHora: nova_hora 
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API-Agenda-Reschedule] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
