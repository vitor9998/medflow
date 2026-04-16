import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { telefone, code } = await req.json();

    if (!telefone || !code) {
      return NextResponse.json(
        { valid: false, reason: "Telefone e código são obrigatórios" },
        { status: 400 }
      );
    }

    const cleanPhone = telefone.replace(/\D/g, "");

    // Buscar último OTP não verificado do telefone
    const { data: otpRecord, error } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("telefone", cleanPhone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !otpRecord) {
      return NextResponse.json({
        valid: false,
        reason: "Nenhum código pendente encontrado. Solicite um novo.",
      });
    }

    // Verificar expiração
    const now = new Date();
    const expiresAt = new Date(otpRecord.expires_at);

    if (now > expiresAt) {
      // Limpar código expirado
      await supabase
        .from("otp_codes")
        .delete()
        .eq("id", otpRecord.id);

      return NextResponse.json({
        valid: false,
        reason: "Código expirado. Solicite um novo.",
      });
    }

    // Verificar código
    if (otpRecord.code !== code.trim()) {
      return NextResponse.json({
        valid: false,
        reason: "Código incorreto. Verifique e tente novamente.",
      });
    }

    // Marcar como verificado
    await supabase
      .from("otp_codes")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    return NextResponse.json({ valid: true });
  } catch {
    return NextResponse.json(
      { valid: false, reason: "Erro no servidor" },
      { status: 500 }
    );
  }
}
