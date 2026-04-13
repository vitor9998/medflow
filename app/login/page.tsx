"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  async function handleLogin(e: any) {
    e.preventDefault();

    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    // 👉 verifica se já tem profile
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user?.id)
      .single();

    if (profile) {
      router.push("/admin");
    } else {
      router.push("/onboarding");
    }

    setLoading(false);
  }

  // 🆕 REGISTRO
  async function handleRegister() {
    if (!email || !senha) {
      alert("Preencha email e senha");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center px-6">

      <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">

        <h1 className="text-2xl font-bold mb-6 text-center text-white">
          Entrar na plataforma
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-3 rounded-lg bg-[#020617] border border-gray-700 text-white focus:outline-none focus:border-green-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Entrar"}
          </button>

        </form>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full border border-gray-600 py-3 rounded-lg mt-4 hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Carregando..." : "Criar conta"}
        </button>

      </div>

    </main>
  );
}