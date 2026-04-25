import * as mcpAgendamento from "@/lib/mcp/agendamento";
import * as mcpConfirmacao from "@/lib/mcp/confirmacao";
import { AgendaActionPayload } from "@/lib/types";

// Agent ONLY orchestrates actions

type Action = "confirmar" | "cancelar" | "presente" | "reagendar" | "tentativa";

export async function agendaAgent(action: Action, payload: any) {
  try {
    const actionPayload: AgendaActionPayload = { id: payload.id };

    switch (action) {
      case "confirmar":
        return await mcpAgendamento.atualizarStatus(actionPayload, "confirmado");
      case "cancelar":
        return await mcpAgendamento.atualizarStatus(actionPayload, "cancelado");
      case "presente":
        return await mcpAgendamento.atualizarStatus(actionPayload, "presente");
      case "reagendar":
        return await mcpAgendamento.reagendar(actionPayload, payload.novaData, payload.novaHora);
      case "tentativa":
        return await mcpConfirmacao.registrarTentativa(actionPayload, payload.atual);
      default:
        throw new Error("Ação não reconhecida pelo Agent");
    }
  } catch (error: any) {
    console.error(`[Agent-Agenda] Erro na ação ${action}:`, error);
    throw error;
  }
}
