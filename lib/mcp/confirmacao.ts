import { supabaseAdmin } from "@/lib/supabase/server";
import { AgendaActionPayload } from "@/lib/types";

// MCP handles ALL database operations for Confirmations using Server Client

export async function registrarPrimeiroEnvio(payload: AgendaActionPayload, tentativasAtuais: number) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update({ 
      lembrete_enviado: true,
      confirmacao_status: "enviado",
      tentativas_contato: (tentativasAtuais || 0) + 1
    })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function registrarTentativa(payload: AgendaActionPayload, atual: number) {
  const novo = (atual || 0) + 1;
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update({ tentativas_contato: novo })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function registrarSemResposta(payload: AgendaActionPayload) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update({ confirmacao_status: "sem_resposta" })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
