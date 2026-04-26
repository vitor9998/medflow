import { NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { isPhoneValid, formatPhone, normalizeMessage } from '@/lib/whatsapp';
import crypto from 'crypto';

/**
 * API Route de alta performance e resiliente para envio de WhatsApp.
 * Fluxo: Validação -> Idempotência -> Persistência -> Processamento Assíncrono.
 */

const whatsappService = new WhatsAppService();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, message, idempotencyKey } = body;

    // 1. Validação de Entrada
    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Parâmetros "phone" e "message" são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanPhone = formatPhone(phone);
    const cleanMessage = normalizeMessage(message);

    if (!isPhoneValid(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Número de telefone inválido' },
        { status: 400 }
      );
    }

    if (cleanMessage.length === 0) {
      return NextResponse.json(
        { success: false, error: 'A mensagem não pode estar vazia' },
        { status: 400 }
      );
    }

    // 2. Gerar Chave de Idempotência (Hash do conteúdo se não fornecida)
    // Isso evita envios duplicados se o cliente disparar a mesma requisição duas vezes por erro de rede
    const finalIdempotencyKey = idempotencyKey || crypto
      .createHash('sha256')
      .update(`${cleanPhone}:${cleanMessage}`)
      .digest('hex');

    // 3. Enfileirar para Processamento (Async)
    const result = await whatsappService.queueMessage(cleanPhone, cleanMessage, finalIdempotencyKey);

    // Retorna imediatamente para o cliente, liberando a UI/UX
    return NextResponse.json(result);

  } catch (err: any) {
    console.error('[WhatsApp API] Erro no processamento da requisição:', err.message);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar mensagem' },
      { status: 500 }
    );
  }
}
