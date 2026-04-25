import * as mcp from "@/lib/mcp/confirmacao";
import { Consulta } from "@/lib/types";
import { determinarCanalComunicacao } from "@/lib/communication";

// Agent ONLY orchestrates actions for Confirmation

export async function confirmacaoAgent(consulta: Consulta, baseUrl: string) {
  try {
    const payload = { id: consulta.id };

    // 1. Se status = cancelado ou ja confirmado → ignorar
    if (consulta.status === 'cancelado') {
      return { success: false, reason: "cancelado" };
    }
    if (consulta.confirmacao_status === 'confirmado') {
      return { success: false, reason: "ja_confirmado" };
    }

    const tentativas = consulta.tentativas_contato || 0;
    const canal = determinarCanalComunicacao(consulta);

    if (canal === "sem_canal") {
      return { success: false, reason: "sem_forma_contato" };
    }

    // 3. Se lembrete_enviado = false OU (lembrete_enviado = true E confirmacao_status != confirmado E tentativas < 2)
    const deveEnviar = !consulta.lembrete_enviado || (consulta.lembrete_enviado && tentativas < 2);

    if (deveEnviar) {
      const isRetentativa = !!consulta.lembrete_enviado;
      
      const res = await fetch(`${baseUrl}/api/lembretes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pendentes: [{
            ...consulta,
            canal_utilizado: canal
          }] 
        })
      });

      if (!res.ok) throw new Error(`Erro API lembretes: ${canal}`);

      if (!isRetentativa) {
        await mcp.registrarPrimeiroEnvio(payload, tentativas);
      } else {
        await mcp.registrarTentativa(payload, tentativas);
      }

      return { 
        success: true, 
        action: isRetentativa ? "re-tentativa" : "primeiro_envio",
        canal 
      };
    }

    if (consulta.lembrete_enviado && tentativas >= 2) {
      await mcp.registrarSemResposta(payload);
      return { success: true, action: "marcado_sem_resposta" };
    }

    return { success: false, reason: "nenhuma_condicao_atendida" };

  } catch (error: any) {
    console.error(`[Agent-Confirmacao] Erro ao processar agendamento ${consulta?.id}:`, error);
    return { success: false, error: error.message };
  }
}
