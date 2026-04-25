import { supabaseAdmin } from "@/lib/supabase/server";
import { AgendaActionPayload } from "@/lib/types";

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
