import { supabase } from "@/lib/supabaseClient";

// MCP handles ALL database operations for Confirmations

export async function registrarEnvio(id: number) {
  const { data, error } = await supabase
    .from("agendamentos")
    .update({ 
      lembrete_enviado: true,
      confirmacao_status: "enviado" // atualiza a nova feature de rastreamento
    })
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
