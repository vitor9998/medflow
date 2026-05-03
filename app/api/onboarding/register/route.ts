import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export async function POST(req: Request) {
  try {
    const { nome, email, telefone, clinic_name } = await req.json();

    if (!nome || !email || !clinic_name || !telefone) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios." }, { status: 400 });
    }

    let clinic_id = slugify(clinic_name);
    
    // Quick check to avoid conflict
    const { data: existing } = await supabase
      .from("doctor_onboarding")
      .select("id")
      .eq("clinic_id", clinic_id);
      
    if (existing && existing.length > 0) {
      clinic_id = `${clinic_id}-${Math.floor(Math.random() * 10000)}`;
    }

    const { data, error } = await supabase
      .from("doctor_onboarding")
      .insert({
        nome,
        email,
        telefone,
        clinic_name,
        clinic_id,
        status: "lead"
      })
      .select("id")
      .single();

    if (error) {
      console.error("Database Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Send WhatsApp message
    // You can integrate here with Evolution API to send the message:
    // "Olá Dr(a). [Nome], preparamos um formulário rápido para personalizar seu sistema Medflow. Leva menos de 2 minutos. Link: https://seusite.com/onboarding/formulario/[data.id]"
    // Update status to "form_sent" if message sent successfully

    return NextResponse.json({ success: true, id: data.id });
    
  } catch (err: any) {
    console.error("Server Error:", err);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
