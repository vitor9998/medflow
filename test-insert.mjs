import { supabase } from "./lib/supabaseClient.js";

async function testInsert() {
  const { data, error } = await supabase
    .from("doctor_onboarding")
    .insert({
      nome: "Test",
      email: "test@test.com",
      telefone: "123",
      clinic_name: "Test",
      clinic_id: "test",
      status: "lead"
    })
    .select("id")
    .single();
    
  console.log("Data:", data);
  console.log("Error:", error);
}

testInsert();
