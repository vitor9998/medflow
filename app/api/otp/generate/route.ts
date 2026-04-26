import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhone } from "@/lib/utils/phone";

export async function POST(req: NextRequest) {
  try {
    const { telefone } = await req.json();

    if (!telefone || telefone.trim().length < 8) {
      return NextResponse.json(
        { success: false, error: "Telefone inválido" },
        { status: 400 }
      );
    }

    const cleanPhone = normalizePhone(telefone);

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiração: 5 minutos a partir de agora
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Deletar OTPs anteriores não verificados do mesmo telefone
    await supabase
      .from("otp_codes")
      .delete()
      .eq("telefone", cleanPhone)
      .eq("verified", false);

    // Inserir novo OTP
    const { error } = await supabase.from("otp_codes").insert([
      {
        telefone: cleanPhone,
        code,
        expires_at: expiresAt,
        verified: false,
      },
    ]);

    if (error) {
      console.error("Erro ao gerar OTP:", error);
      return NextResponse.json(
        { success: false, error: "Erro interno ao gerar código" },
        { status: 500 }
      );
    }

    // 🔧 MVP: Retorna o código na response para simular envio
    // Em produção, aqui entraria a integração com Twilio/SMS/WhatsApp
    return NextResponse.json({
      success: true,
      // Remover em produção — apenas para testes MVP
      _dev_code: code,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Erro no servidor" },
      { status: 500 }
    );
  }
}
