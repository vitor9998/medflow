import { NextResponse } from 'next/server';

/**
 * Rota de teste para validar o envio real via Evolution API.
 * Acesse: http://localhost:3000/api/test-whatsapp
 */
export async function GET(req: Request) {
  try {
    const { protocol, host } = new URL(req.url);
    const baseUrl = `${protocol}//${host}`;

    // Faz a chamada interna para a rota de envio real
    const response = await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: "5511948157490",
        message: "Teste Evolution API funcionando 🚀"
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      api_response: data
    });

  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
