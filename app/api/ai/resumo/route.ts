import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { id, sintomas, observacoes_paciente } = await req.json();

    if (!id || (!sintomas && !observacoes_paciente)) {
      return NextResponse.json({ error: 'Dados insuficientes' }, { status: 400 });
    }

    const textoBase = `Motivo: ${sintomas || 'Nenhum'}\nObservacoes: ${observacoes_paciente || 'Nenhuma'}`;

    // Prompt simples e economico (modelo: gpt-4o-mini ou gpt-3.5-turbo)
    const systemPrompt = `Você é um assistente médico organizador.
Sua tarefa é ler o relato do paciente e gerar um resumo curto e direto, em tópicos (máx 3 a 4 pontos).
REGRA: NUNCA sugira um diagnóstico. Apenas organize a queixa para leitura rápida do médico. Responda apenas com os tópicos, sem introduções.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: textoBase }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Erro na API da OpenAI: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const resumo_ia = data.choices[0].message.content.trim();

    // Salvar no banco
    const { error: updError } = await supabase
      .from('agendamentos')
      .update({ resumo_ia })
      .eq('id', id);

    if (updError) {
      throw new Error(`Erro ao salvar no banco: ${updError.message}`);
    }

    return NextResponse.json({ resumo_ia });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
