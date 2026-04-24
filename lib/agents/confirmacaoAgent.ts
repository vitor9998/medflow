import * as mcp from "@/lib/mcp/confirmacao";

// Agent ONLY orchestrates actions for Confirmation

export async function confirmacaoAgent(consulta: any, baseUrl: string) {
  try {
    // Validações orquestradas pelo Agent
    if (consulta.status === 'cancelado') {
      return { success: false, reason: "cancelado" };
    }
    
    if (consulta.lembrete_enviado) {
      return { success: false, reason: "ja_enviado" };
    }

    // 1. Enviar lembrete
    const res = await fetch(`${baseUrl}/api/lembretes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendentes: [consulta] })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(`Erro API lembretes: ${err?.error || res.statusText}`);
    }

    // 2. Registrar Envio via MCP
    await mcp.registrarEnvio(consulta.id);

    // 3. Registrar Tentativa via MCP
    await mcp.registrarTentativa(consulta.id, consulta.tentativas_contato || 0);

    return { success: true };

  } catch (error: any) {
    console.error(`[Agent-Confirmacao] Erro ao processar agendamento ${consulta?.id}:`, error);
    return { success: false, error: error.message };
  }
}
