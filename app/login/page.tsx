"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    })

    if (error) {
      alert("Erro ao enviar email")
    } else {
      alert("Verifique seu email para login!")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-3xl rounded-full top-[-100px] left-[-100px]" />
      <div className="absolute w-[400px] h-[400px] bg-indigo-500/20 blur-3xl rounded-full bottom-[-100px] right-[-100px]" />

      {/* Card */}
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Bem-vindo 👋
        </h1>

        <p className="text-gray-400 text-center mb-6">
          Entre com seu email para acessar
        </p>

        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          onClick={handleLogin}
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition shadow-lg"
        >
          Entrar
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Login sem senha via email ✨
        </p>
      </div>
    </div>
  )
}