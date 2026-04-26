import { supabaseAdmin } from './lib/supabase/server.js';

async function check() {
  try {
    const { data: messages, error: mError } = await supabaseAdmin
      .from('whatsapp_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (mError) {
      console.error('Error fetching messages:', mError);
    } else {
      console.log('--- ULTIMAS MENSAGENS NA FILA ---');
      console.log(JSON.stringify(messages, null, 2));
    }

    const { data: appts, error: aError } = await supabaseAdmin
      .from('agendamentos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (aError) {
      console.error('Error fetching appointments:', aError);
    } else {
      console.log('--- ULTIMOS AGENDAMENTOS ---');
      console.log(JSON.stringify(appts, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
}

check();
