import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: Request) {
  try {
    // 1. SEGURANÇA: Validar CRON_SECRET (configurado nos envs da Vercel/Producao)
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. BUSCAR PENDENTES DE AMANHA
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1);
    const dataAmanhaFormatada = amanha.toISOString().split('T')[0];

    // Aqui buscamos todos os agendamentos (qualquer doctor) que sao para amanhã e nao tem lembrete enviado.
    // DICA: Se usar RLS estrito no Supabase, certifique-se de configurar a bypass policy para chamadas de rotas servidor ou usar a service_role_key.
    const { data: pendentesUnfiltered, error: fError } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('data', dataAmanhaFormatada);

    if (fError) throw fError;

    // Filtramos manualmente pelo lembrete_enviado falso ou nulo (já que a comparacao eq('lembrete_enviado', false) pode pular nulos dependendo do bd)
    const pendentes = (pendentesUnfiltered || []).filter(c => c.status !== 'cancelado' && !c.lembrete_enviado);

    if (!pendentes || pendentes.length === 0) {
      return NextResponse.json({ message: 'Nenhum lembrete para enviar', enviados: 0 });
    }

    // 3. REAPROVEITAR LÓGICA DE ENVIO (/api/lembretes)
    // Resolvemos as URLs locais e em producao (Vercel) para fazer o POST reutilizando nossa logica original.
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/lembretes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendentes })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(`Erro API lembretes: ${err.error || res.statusText}`);
    }

    // 4. ATUALIZAR STATUS PARA ENVIADO NO BANCO
    for (const c of pendentes) {
        const { error: updError } = await supabase
           .from("agendamentos")
           .update({ lembrete_enviado: true })
           .eq("id", c.id);
           
        if (updError) console.error("Falha ao registrar envio no Cron:", updError);
    }

    return NextResponse.json({ success: true, enviados: pendentes.length });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
