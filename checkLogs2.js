const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  // Let's see if there's any log of the raw payload somewhere, or just view the latest webhook errors.
  // Actually, there's no raw payload logged in the database by default unless they have an integration logs table.
  const { data } = await supabase.from('whatsapp_messages').select('*').order('created_at', { ascending: false }).limit(10);
  console.log(JSON.stringify(data, null, 2));
}
run();
