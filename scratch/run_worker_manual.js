require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runWorkerManual() {
  console.log('Checking for pending messages...');
  const { data: messages, error } = await supabase
    .from('whatsapp_messages')
    .select('*')
    .eq('status', 'pending')
    .limit(1);

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }

  if (!messages || messages.length === 0) {
    console.log('No pending messages found.');
    return;
  }

  const msg = messages[0];
  console.log(`Sending message ${msg.id} to ${msg.phone}...`);

  // Simulate sending (we would normally use the provider here)
  // For now, let's just mark it as sent in the DB to see if we have access
  const { error: updateError } = await supabase
    .from('whatsapp_messages')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', msg.id);

  if (updateError) {
    console.error('Error updating status:', updateError);
  } else {
    console.log('Message marked as sent in DB.');
  }
}

runWorkerManual();
