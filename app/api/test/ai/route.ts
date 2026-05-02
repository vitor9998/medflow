import { NextResponse } from "next/server";
import { AIService } from "@/lib/services/aiService";

/**
 * Endpoint de teste para validar a resposta da IA (OpenAI).
 * Acesse via navegador ou Postman para ver como a ZyntraMed interpreta as mensagens.
 * 
 * Exemplo de uso:
 * GET /api/test/ai?message=Quero+confirmar+minha+consulta+de+amanha
 */

const aiService = new AIService();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const message = searchParams.get("message");

    if (!message) {
      return NextResponse.json({ 
        error: "Envie uma mensagem no parâmetro ?message=..." 
      }, { status: 400 });
    }

    // Contexto mockado para o teste
    const mockContext = {
      paciente_nome: "Vitor Kenji",
      medico_nome: "Dr. Silva",
      especialidade: "Cardiologia",
      data: "2026-05-10",
      hora: "14:30"
    };

    console.log(`[Test IA] Testando mensagem: "${message}"`);
    
    const result = await aiService.handleConversation(message, mockContext);

    return NextResponse.json({
      input: {
        message,
        context: mockContext
      },
      output: result
    });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message 
    }, { status: 500 });
  }
}
