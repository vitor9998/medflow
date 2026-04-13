"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Email ou senha inválidos");
    } else {
      router.push("/admin");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">

      <form
        onSubmit={handleLogin}
        className="bg-[#0B1120] p-8 rounded-2xl border border-gray-800 w-[350px] space-y-4"
      >
        <h1 className="text-xl font-bold text-center">
          Entrar na plataforma
        </h1>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        {/* 🔥 NOVO BOTÃO CORRETO */}
        <Link
          href="/signup"
          className="w-full border border-gray-700 py-3 rounded-lg text-center block hover:bg-gray-800 transition"
        >
          Criar conta
        </Link>
      </form>

    </div>
  );
}