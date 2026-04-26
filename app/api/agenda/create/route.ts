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

    // Disparar WhatsApp automaticamente (Fire-and-forget)
    const whatsappService = new (await import("@/lib/services/whatsappService")).WhatsAppService();
    const telefone = payload.telefone || payload.phone;
    
    if (telefone) {
      const dataFormatada = payload.data.split('-').reverse().join('/');
      const message = `Olá ${payload.nome}, sua consulta foi agendada para ${dataFormatada} às ${payload.hora}.`;
      
      // Enfileira diretamente sem depender de rota externa
      whatsappService.queueMessage(telefone, message, `new-appt-${result.id}`)
        .catch(err => console.error("[WhatsApp-Auto] Erro ao enfileirar:", err));
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[API-Agenda-Create] Erro:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
