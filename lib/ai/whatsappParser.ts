/**
 * Utilitário de IA para extrair informações de data e hora de mensagens naturais.
 */

export async function parseReschedule(text: string) {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = today.toLocaleDateString('pt-BR', { weekday: 'long' });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Você é um assistente de agendamento médico. Sua tarefa é extrair a DATA e a HORA de reagendamento solicitadas pelo paciente.
          
          Regras:
          1. Retorne APENAS um JSON no formato: {"data": "YYYY-MM-DD", "hora": "HH:mm"}.
          2. Se a data ou hora não forem encontradas, retorne null para o campo.
          3. Considere que hoje é ${todayStr} (${dayOfWeek}).
          4. Interprete termos relativos como "amanhã", "segunda que vem", "quinta", etc.`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API Error: ${response.status}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  
  return {
    data: content.data || null,
    hora: content.hora || null
  };
}
