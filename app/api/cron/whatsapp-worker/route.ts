import { NextResponse } from 'next/server';
import { WhatsAppWorker } from '@/lib/workers/whatsappWorker';

/**
 * Endpoint de Cron para disparar o processamento do Worker de WhatsApp.
 * Pode ser chamado via Vercel Cron, GitHub Actions ou Cron local.
 * Segurança: Recomenda-se adicionar uma verificação de token de autorização.
 */

const worker = new WhatsAppWorker();

export async function GET(req: Request) {
  try {
    // 1. Verificação de Autorização (Opcional - Recomendado)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // 2. Executa a rodada do Worker
    // Nota: O Worker processa um lote (batch) de mensagens por rodada.
    await worker.run();

    return NextResponse.json({ 
      success: true, 
      timestamp: new Date().toISOString() 
    });

  } catch (err: any) {
    console.error('[Cron WhatsApp] Erro ao disparar worker:', err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
