import { createClient } from "@supabase/supabase-js"
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceRoleKey!);

async function debugAppointment() {
  const phone = "11948157490";
  const { data, error } = await supabaseAdmin
    .from('agendamentos')
    .select('id, data, hora, status, telefone')
    .ilike('telefone', `%${phone}%`);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Current Server Date:', new Date().toISOString());
    console.log('Today in Code:', new Date().toISOString().split('T')[0]);
    console.log('Found appointments:', data);
  }
}

debugAppointment();
