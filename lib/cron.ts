import cron from 'node-cron';

/**
 * Sistema de Cron Local para desenvolvimento.
 * Dispara o gerador de lembretes e o worker de processamento.
 */
export function startLocalCron() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('--- [Local Cron] Agendador ativo (Lembretes + Worker) ---');

  // Agenda para rodar a cada minuto
  cron.schedule('* * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[Local Cron] ${timestamp} - Iniciando processamento...`);

    try {
      // 1. Dispara o Gerador de Lembretes (Procura consultas de amanhã e coloca na fila)
      const reminderUrl = `http://localhost:3000/api/cron/appointment-reminders`;
      const reminderRes = await fetch(reminderUrl, {
        headers: { 'Authorization': `Bearer ${process.env.CRON_SECRET}` }
      });
      
      // 2. Dispara o Worker (Envia o que está na fila via WhatsApp)
      const workerUrl = `http://localhost:3000/api/cron/whatsapp-worker?token=${process.env.CRON_SECRET}`;
      const workerRes = await fetch(workerUrl);

      if (reminderRes.ok && workerRes.ok) {
        console.log(`[Local Cron] Sucesso: Lembretes gerados e Worker processado.`);
      } else {
        console.warn(`[Local Cron] Aviso: Lembretes (${reminderRes.status}), Worker (${workerRes.status})`);
      }
    } catch (error) {
      console.error(`[Local Cron] Erro ao conectar com os endpoints:`, error);
    }
  });
}
