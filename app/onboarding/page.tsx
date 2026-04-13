"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function OnboardingPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");

  // 🔒 impede acesso sem login
  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
      }
    }

    checkUser();
  }, []);

  async function handleSubmit(e: any) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("profiles").insert({
      id: user?.id,
      nome,
      especialidade,
      telefone,
    });

    if (error) {
      alert("Erro ao salvar");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-6">
      <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold mb-4">
          Configure seu consultório
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Nome"
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            placeholder="Especialidade"
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
          />

          <input
            placeholder="Telefone"
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <button className="w-full bg-green-500 py-3 rounded-lg font-semibold">
            Continuar
          </button>

        </form>

      </div>
    </main>
  );
}