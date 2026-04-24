import { supabase } from "@/lib/supabaseClient";

// MCP handles ALL database operations

export async function atualizarStatus(id: number, status: string) {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function reagendar(id: number, novaData: string, novaHora: string) {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ data: novaData, hora: novaHora, status: "pendente" })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function registrarTentativa(id: number, atual: number) {
  const novo = (atual || 0) + 1;
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ tentativas_contato: novo })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
