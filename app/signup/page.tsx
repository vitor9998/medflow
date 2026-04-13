"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);

    // 🔐 cria usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao criar conta");
      setLoading(false);
      return;
    }

    if (data.user) {
      const slug = nome
        .toLowerCase()
        .replace(/\s+/g, "-");

      // 🔥 cria profile completo
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            nome,
            slug,
            especialidade,
            telefone,
          },
        ]);

      if (profileError) {
        console.log(profileError);
        alert("Erro ao criar perfil");
      } else {
        alert("Conta criada com sucesso!");
        router.push("/admin");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">

      <form
        onSubmit={handleSignup}
        className="bg-[#0B1120] p-8 rounded-2xl border border-gray-800 w-[400px] space-y-4"
      >
        <h1 className="text-xl font-bold text-center">
          Criar conta médica
        </h1>

        <input
          placeholder="Nome completo"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <input
          placeholder="Especialidade"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700"
          value={especialidade}
          onChange={(e) => setEspecialidade(e.target.value)}
          required
        />

        <input
          placeholder="Telefone (opcional)"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}