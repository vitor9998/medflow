import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Carrega o .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: Variáveis de ambiente não encontradas no .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log("--- DIAGNÓSTICO DE AGENDAMENTOS ---");
  
  const { data, error } = await supabase
    .from('agendamentos')
    .select('nome, telefone, data, status')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("Erro ao buscar agendamentos:", error.message);
    return;
  }

  console.log("Últimos 5 agendamentos cadastrados:");
  console.table(data);

  const testPhone = "5511948157490";
  const last8 = testPhone.slice(-8);
  
  const { data: search } = await supabase
    .from('agendamentos')
    .select('nome, telefone, data, status')
    .or(`telefone.ilike.%${last8}%,phone.ilike.%${last8}%`);

  console.log(`\nBusca pelo final do número ${last8}:`);
  console.table(search);
}

diagnose();
