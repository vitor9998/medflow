const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: messages } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('--- MESSAGES ---');
  console.log(JSON.stringify(messages, null, 2));

  const { data: appts } = await supabase
    .from('agendamentos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('--- APPOINTMENTS ---');
  console.log(JSON.stringify(appts, null, 2));
}

check();
