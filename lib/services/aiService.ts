import OpenAI from "openai";

/**
 * Interface para a resposta estruturada da IA.
 */
export interface AIResult {
  intent: "confirm" | "cancel" | "reschedule" | "question" | "unknown";
  response: string;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Serviço de Inteligência Artificial para conversas via WhatsApp.
 * Especializado em entender intenções complexas e responder dúvidas simples.
 */
export class AIService {
  /**
   * Analisa a mensagem do paciente usando OpenAI.
   * 
   * @param message Mensagem enviada pelo paciente
   * @param context Contexto do agendamento (data, hora, nome do médico, etc)
   * @returns Resultado com intenção detectada e resposta sugerida
   */
  async handleConversation(message: string, context: any): Promise<AIResult> {
    if (!process.env.OPENAI_API_KEY) {
      console.error("[AIService] Erro: OPENAI_API_KEY não configurada.");
      return this.fallbackResponse();
    }

    // Segurança: Limitar tamanho da mensagem
    const truncatedMessage = message.substring(0, 500);

    const systemPrompt = `Você é um assistente virtual de uma clínica médica chamado Medflow.
Sua função é auxiliar pacientes com seus agendamentos via WhatsApp.

CONTEXTO DO AGENDAMENTO ATUAL:
- Paciente: ${context.paciente_nome || "Não informado"}
- Médico: ${context.medico_nome || "Não informado"}
- Especialidade: ${context.especialidade || "Médico"}
- Data: ${context.data ? context.data.split('-').reverse().join('/') : "Não informada"}
- Horário: ${context.hora || "Não informado"}

OBJETIVO:
- Ajudar a confirmar consultas
- Ajudar a cancelar consultas
- Ajudar a reagendar consultas
- Responder perguntas simples sobre a clínica ou o agendamento

REGRAS:
- Seja curto, direto e claro.
- Seja sempre educado.
- Não invente informações que não estão no contexto.
- Se não tiver certeza da intenção do paciente, peça esclarecimentos gentilmente.
- Se o paciente quiser reagendar mas não disser a data/hora, peça essas informações.

FORMATO DE SAÍDA:
Você deve responder EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "intent": "confirm" | "cancel" | "reschedule" | "question" | "unknown",
  "response": "texto da mensagem para enviar ao paciente"
}
`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // Ou gpt-4o se disponível
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: truncatedMessage }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      clearTimeout(timeoutId);

      const content = response.choices[0]?.message?.content;
      if (!content) throw new Error("Resposta vazia da OpenAI");

      return JSON.parse(content) as AIResult;

    } catch (err: any) {
      console.error("[AIService] Erro ao chamar OpenAI:", err.message);
      return this.fallbackResponse();
    }
  }

  /**
   * Resposta de segurança caso a IA falhe.
   */
  private fallbackResponse(): AIResult {
    return {
      intent: "unknown",
      response: "Desculpe, não consegui processar sua mensagem agora. Poderia repetir ou aguardar um momento?"
    };
  }
}
