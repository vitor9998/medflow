import cron from 'node-cron';

/**
 * Sistema de Cron Local para desenvolvimento.
 * Dispara o worker de WhatsApp a cada minuto.
 */
export function startLocalCron() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('--- [Local Cron] Iniciando agendador de tarefas... ---');

  // Agenda para rodar a cada minuto
  cron.schedule('* * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[Local Cron] ${timestamp} - Disparando worker...`);

    try {
      const url = `http://localhost:3000/api/cron/whatsapp-worker?token=${process.env.CRON_SECRET}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        console.log(`[Local Cron] Sucesso:`, data);
      } else {
        console.error(`[Local Cron] Erro (${response.status}):`, data);
      }
    } catch (error) {
      console.error(`[Local Cron] Erro ao conectar com o worker:`, error);
    }
  });

  console.log('--- [Local Cron] Agendador ativo (1 min) ---');
}
