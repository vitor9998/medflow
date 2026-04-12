"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { User, Mail, Phone, Calendar } from "lucide-react"

export default function AgendamentoPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [data, setData] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert("Você precisa estar logado")
      return
    }

    const { error } = await supabase.from("agendamentos").insert([
      {
        nome,
        email,
        telefone,
        data,
        user_id: user.id,
      },
    ])

    if (error) {
      alert("Erro ao salvar")
      console.log(error)
    } else {
      alert("Agendamento realizado!")
      setNome("")
      setEmail("")
      setTelefone("")
      setData("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617]">
      <form
        onSubmit={handleSubmit}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-bold text-center text-white mb-4">
          Agendar Consulta
        </h1>

        {/* Nome */}
        <div className="flex items-center bg-white/10 rounded-xl px-4 py-3">
          <User className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="bg-transparent outline-none w-full text-white placeholder-gray-400"
          />
        </div>

        {/* Email */}
        <div className="flex items-center bg-white/10 rounded-xl px-4 py-3">
          <Mail className="text-gray-400 mr-2" size={18} />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent outline-none w-full text-white placeholder-gray-400"
          />
        </div>

        {/* Telefone */}
        <div className="flex items-center bg-white/10 rounded-xl px-4 py-3">
          <Phone className="text-gray-400 mr-2" size={18} />
          <input
            type="text"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="bg-transparent outline-none w-full text-white placeholder-gray-400"
          />
        </div>

        {/* Data */}
        <div className="flex items-center bg-white/10 rounded-xl px-4 py-3">
          <Calendar className="text-gray-400 mr-2" size={18} />
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="bg-transparent outline-none w-full text-white"
          />
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition shadow-lg"
        >
          Confirmar Agendamento
        </button>
      </form>
    </div>
  )
}