require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Last 5 WhatsApp Messages:');
  console.table(data.map(m => ({
    id: m.id,
    phone: m.phone,
    status: m.status,
    message: m.message.substring(0, 30) + '...',
    created: m.created_at
  })));
}

check();
