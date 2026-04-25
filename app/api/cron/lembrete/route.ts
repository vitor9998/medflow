import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { confirmacaoAgent } from '@/lib/agents/confirmacaoAgent';

export async function GET(req: Request) {
  try {
    // 1. SEGURANÇA: Validar CRON_SECRET (configurado nos envs da Vercel/Producao)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. BUSCAR PENDENTES DE AMANHA (Corrigido para Fuso BR)
    const amanha = new Date();
    amanha.setHours(amanha.getHours() - 3); // Força UTC-3 para evitar virada de dia incorreta
    amanha.setDate(amanha.getDate() + 1);
    const dataAmanhaFormatada = amanha.toISOString().split('T')[0];

    // Aqui buscamos todos os agendamentos (qualquer doctor) que sao para amanhã e nao tem lembrete enviado.
    // Usamos supabaseAdmin para garantir permissão de leitura total (bypass RLS).
    const { data: pendentesUnfiltered, error: fError } = await supabaseAdmin
      .from('agendamentos')
      .select('*')
      .eq('data', dataAmanhaFormatada);

    if (fError) throw fError;

    // O Agent fará as validações de envio e re-envio, então não filtramos por lembrete_enviado aqui
    const pendentes = (pendentesUnfiltered || []).filter(c => c.status !== 'cancelado');

    if (!pendentes || pendentes.length === 0) {
      return NextResponse.json({ message: 'Nenhum lembrete para enviar', enviados: 0 });
    }

    // 3. ENVIAR VIA AGENT (UM A UM)
    // Resolvemos as URLs locais e em producao (Vercel) para passar para o Agent
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    let enviados = 0;
    
    // O Agent processa, dispara e registra no MCP
    for (const c of pendentes) {
        const resultado = await confirmacaoAgent(c, baseUrl);
        if (resultado?.success) enviados++;
    }

    return NextResponse.json({ success: true, enviados });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
