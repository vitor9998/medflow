import * as mcpAgendamento from "@/lib/mcp/agendamento";
import * as mcpConfirmacao from "@/lib/mcp/confirmacao";
import { AgendaActionPayload } from "@/lib/types";

// Agent ONLY orchestrates actions

type Action = "confirmar" | "cancelar" | "presente" | "reagendar" | "tentativa" | "criar" | "atualizar_prontuario";

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
      case "reagendar": {
        // 1. Buscar consulta atual para saber o médico
        const consulta = await mcpAgendamento.buscarPorId(payload.id);
        
        // 2. Verificar se o novo horário está disponível
        const disponivel = await mcpAgendamento.verificarDisponibilidade(
          consulta.user_id,
          payload.novaData,
          payload.novaHora,
          payload.id // ignora a própria consulta
        );

        if (!disponivel) {
          throw new Error("O novo horário selecionado já está ocupado.");
        }

        // 3. Executar o reagendamento
        return await mcpAgendamento.reagendar(actionPayload, payload.novaData, payload.novaHora);
      }
      case "tentativa":
        return await mcpConfirmacao.registrarTentativa(actionPayload, payload.atual);
      case "criar":
        // Aqui poderiam entrar validações extras antes do MCP
        return await mcpAgendamento.criarAgendamento(payload);
      case "atualizar_prontuario": {
        const { id, ...campos } = payload;
        // Mapeamento opcional se os campos no payload forem diferentes do banco
        // O usuário solicitou campos 'prontuario' e 'evolucao'
        const updateData: any = {};
        if (campos.prontuario !== undefined) updateData.observacoes_medico = campos.prontuario;
        if (campos.evolucao !== undefined) updateData.evolucao = campos.evolucao;
        if (campos.diagnostico !== undefined) updateData.diagnostico_final = campos.diagnostico;
        if (campos.resumo_ia !== undefined) updateData.resumo_ia = campos.resumo_ia;

        return await mcpAgendamento.atualizarRegistroClinico(id, updateData);
      }
      default:
        throw new Error("Ação não reconhecida pelo Agent");
    }
  } catch (error: any) {
    console.error(`[Agent-Agenda] Erro na ação ${action}:`, error);
    throw error;
  }
}
