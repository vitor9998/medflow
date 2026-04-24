import * as mcp from "@/lib/mcp/agendamento";

// Agent ONLY orchestrates actions

type Action = "confirmar" | "cancelar" | "presente" | "reagendar" | "tentativa";

export async function agendaAgent(action: Action, payload: any) {
  try {
    switch (action) {
      case "confirmar":
        return await mcp.atualizarStatus(payload.id, "confirmado");
      case "cancelar":
        return await mcp.atualizarStatus(payload.id, "cancelado");
      case "presente":
        return await mcp.atualizarStatus(payload.id, "presente");
      case "reagendar":
        return await mcp.reagendar(payload.id, payload.novaData, payload.novaHora);
      case "tentativa":
        return await mcp.registrarTentativa(payload.id, payload.atual);
      default:
        throw new Error("Ação não reconhecida pelo Agent");
    }
  } catch (error: any) {
    console.error(`[Agent-Agenda] Erro na ação ${action}:`, error);
    throw error;
  }
}
