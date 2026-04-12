"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await handleRedirect(user.id)
    }
  }

  const handleRedirect = async (userId: string) => {
    // busca perfil
    let { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    // se não existir, cria como patient
    if (!profile) {
      const { data: userData } = await supabase.auth.getUser()

      await supabase.from("profiles").insert([
        {
          id: userId,
          email: userData.user?.email,
          role: "patient",
        },
      ])

      router.push("/agendamento")
      return
    }

    // se for admin
    if (profile.role === "admin") {
      router.push("/admin")
    } else {
      router.push("/agendamento")
    }
  }

  const handleLogin = async () => {
    if (!email) {
      alert("Digite seu email")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/login",
      },
    })

    setLoading(false)

    if (error) {
      alert("Erro ao enviar email")
    } else {
      alert("Email enviado! Verifique sua caixa 📩")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b]">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Bem-vindo 👋
        </h1>

        <input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/10 text-white"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600"
        >
          {loading ? "Enviando..." : "Entrar"}
        </button>
      </div>
    </div>
  )
}