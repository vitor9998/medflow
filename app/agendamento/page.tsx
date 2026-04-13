"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { User, Mail, Phone, Calendar } from "lucide-react"

function calcularPrioridade(sintomas: string) {
  const texto = sintomas.toLowerCase()

  if (
    texto.includes("febre") ||
    texto.includes("dor forte") ||
    texto.includes("falta de ar") ||
    texto.includes("pressão no peito")
  ) {
    return "urgente"
  }

  if (
    texto.includes("dor") ||
    texto.includes("cansaço") ||
    texto.includes("tontura")
  ) {
    return "moderado"
  }

  return "leve"
}

export default function AgendamentoPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [sintomas, setSintomas] = useState("")
  const [loading, setLoading] = useState(false)

  async function salvar(e: any) {
  e.preventDefault()
  setLoading(true)

  const prioridade = calcularPrioridade(sintomas)

  // 🔥 PEGA USUÁRIO LOGADO
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    alert("Você precisa estar logado")
    setLoading(false)
    return
  }

  // 🔥 SALVA COM USER_ID
  const { error } = await supabase.from("agendamentos").insert([
    {
      nome,
      email,
      telefone,
      data,
      hora,
      sintomas,
      status: "pendente",
      prioridade,
      user_id: user.id, // 🔥 ISSO AQUI É O MULTI-TENANT
    },
  ])

  if (error) {
    alert("Erro ao salvar")
    console.log(error)
  } else {
    alert("Consulta agendada com sucesso!")
    setNome("")
    setEmail("")
    setTelefone("")
    setData("")
    setHora("")
    setSintomas("")
  }

  setLoading(false)
}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">
      <form
        onSubmit={salvar}
        className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-[400px] space-y-4 border border-white/20"
      >
        <h1 className="text-white text-2xl font-bold text-center">
          Agendar Consulta
        </h1>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
          <User className="text-white" size={18} />
          <input
            placeholder="Nome"
            className="bg-transparent outline-none text-white w-full"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
          <Mail className="text-white" size={18} />
          <input
            placeholder="Email"
            className="bg-transparent outline-none text-white w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-3 rounded-lg">
          <Phone className="text-white" size={18} />
          <input
            placeholder="Telefone"
            className="bg-transparent outline-none text-white w-full"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
          />
        </div>

        <input
          type="date"
          className="w-full p-3 rounded-lg bg-white/10 text-white"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        <input
          type="time"
          className="w-full p-3 rounded-lg bg-white/10 text-white"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />

        <textarea
          placeholder="Descreva seus sintomas..."
          className="w-full p-3 rounded-lg bg-white/10 text-white"
          value={sintomas}
          onChange={(e) => setSintomas(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          {loading ? "Salvando..." : "Confirmar Agendamento"}
        </button>
      </form>
    </div>
  )
}