import { supabaseAdmin } from "@/lib/supabase/server";
import { AgendaActionPayload } from "@/lib/types";
import { normalizePhone } from "@/lib/utils/phone";

// MCP handles ALL database operations using Server Client

export async function atualizarStatus(payload: AgendaActionPayload, status: string) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update({ status })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function reagendar(payload: AgendaActionPayload, novaData: string, novaHora: string) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update({ data: novaData, hora: novaHora, status: "pendente" })
    .eq("id", payload.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function criarAgendamento(payload: any) {
  // Buscar clinica_id do medico se nao vier no payload
  if (!payload.clinica_id && payload.user_id) {
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("clinica_id")
      .eq("id", payload.user_id)
      .single();
    
    if (prof?.clinica_id) {
      payload.clinica_id = prof.clinica_id;
    }
  }

  // Normalizar telefones
  if (payload.telefone) payload.telefone = normalizePhone(payload.telefone);
  if (payload.phone) payload.phone = normalizePhone(payload.phone);

  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .insert([payload])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
export async function buscarPorId(id: number) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function verificarDisponibilidade(medicoId: string, data: string, hora: string, ignoreId?: number) {
  let query = supabaseAdmin
    .from("agendamentos")
    .select("id")
    .eq("user_id", medicoId)
    .eq("data", data)
    .eq("hora", hora)
    .neq("status", "cancelado");

  if (ignoreId) {
    query = query.neq("id", ignoreId);
  }
  const { data: existente, error } = await query;
  
  if (error) throw new Error(error.message);
  return (existente || []).length === 0;
}

export async function atualizarRegistroClinico(id: number, campos: any) {
  const { data, error } = await supabaseAdmin
    .from("agendamentos")
    .update(campos)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
