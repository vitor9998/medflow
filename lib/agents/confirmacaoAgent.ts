import * as mcp from "@/lib/mcp/confirmacao";

// Agent ONLY orchestrates actions for Confirmation

export async function confirmacaoAgent(consulta: any, baseUrl: string) {
  try {
    // 1. Se status = cancelado → ignorar
    if (consulta.status === 'cancelado') {
      return { success: false, reason: "cancelado" };
    }
    
    // 2. Se confirmacao_status = confirmado → NÃO fazer nada
    if (consulta.confirmacao_status === 'confirmado') {
      return { success: false, reason: "ja_confirmado" };
    }

    const tentativas = consulta.tentativas_contato || 0;

    // 3. Se lembrete_enviado = false
    if (!consulta.lembrete_enviado) {
      const res = await fetch(`${baseUrl}/api/lembretes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendentes: [consulta] })
      });

      if (!res.ok) throw new Error("Erro API lembretes");

      await mcp.registrarEnvio(consulta.id);
      await mcp.registrarTentativa(consulta.id, tentativas);
      return { success: true, action: "primeiro_envio" };
    }

    // 4. Se lembrete_enviado = true E confirmacao_status != confirmado
    if (consulta.lembrete_enviado && consulta.confirmacao_status !== 'confirmado') {
      if (tentativas < 2) {
        // Enviar novamente
        const res = await fetch(`${baseUrl}/api/lembretes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pendentes: [consulta] })
        });

        if (!res.ok) throw new Error("Erro API lembretes na re-tentativa");

        await mcp.registrarTentativa(consulta.id, tentativas);
        return { success: true, action: "re-tentativa" };
      } else {
        // Excedeu tentativas
        await mcp.registrarSemResposta(consulta.id);
        return { success: true, action: "marcado_sem_resposta" };
      }
    }

    return { success: false, reason: "nenhuma_condicao_atendida" };

  } catch (error: any) {
    console.error(`[Agent-Confirmacao] Erro ao processar agendamento ${consulta?.id}:`, error);
    return { success: false, error: error.message };
  }
}
