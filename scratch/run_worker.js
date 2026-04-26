import { WhatsAppWorker } from './lib/workers/whatsappWorker.js';

// No tsx, podemos usar o caminho relativo direto
async function run() {
  console.log('Iniciando processamento de mensagens...');
  const worker = new WhatsAppWorker();
  await worker.run();
  console.log('Processamento concluído.');
}

run().catch(console.error);
