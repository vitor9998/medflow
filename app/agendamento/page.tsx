"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AgendamentoPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [data, setData] = useState("")
  const [hora, setHora] = useState("")
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([])

  const gerarHorarios = () => {
    const horarios = []
    for (let h = 8; h < 18; h++) {
      const horaFormatada = h.toString().padStart(2, "0") + ":00"
      horarios.push(horaFormatada)
    }
    return horarios
  }

  const buscarDisponiveis = async (dataSelecionada: string) => {
    const { data: ocupados } = await supabase
      .from("agendamentos")
      .select("hora")
      .eq("data", dataSelecionada)

    const todos = gerarHorarios()
    const ocupadosLista = ocupados?.map((item) => item.hora) || []

    const livres = todos.filter((h) => !ocupadosLista.includes(h))

    setHorariosDisponiveis(livres)
  }

  // 🔥 BLOQUEAR DOMINGO
const isDomingo = (dataSelecionada: string) => {
  const [ano, mes, dia] = dataSelecionada.split("-").map(Number)

  const dataLocal = new Date(ano, mes - 1, dia) // 🔥 força data local

  return dataLocal.getDay() === 0
}

  useEffect(() => {
    if (data) {
      if (isDomingo(data)) {
        alert("Não atendemos aos domingos!")
        setData("")
        setHora("")
        setHorariosDisponiveis([])
        return
      }

      buscarDisponiveis(data)
    }
  }, [data])

  const salvar = async () => {
    if (!nome || !email || !telefone || !data || !hora) {
      alert("Preencha todos os campos!")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("agendamentos").insert([
      {
        nome,
        email,
        telefone,
        data,
        hora,
        user_id: user?.id,
        status: "pendente",
      },
    ])

    if (error) {
      alert("Erro ao salvar")
    } else {
      alert("Agendamento criado!")
      setNome("")
      setEmail("")
      setTelefone("")
      setData("")
      setHora("")
      setHorariosDisponiveis([])
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
      <div className="bg-white/5 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-2xl font-bold mb-6">
          Agendar Consulta
        </h1>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-white/10"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-white/10"
        />

        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className="w-full mb-3 p-3 rounded bg-white/10"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => {
            setData(e.target.value)
            setHora("")
          }}
          className="w-full mb-3 p-3 rounded bg-white/10"
        />

        {data && (
          <div className="mb-4">
            <p className="mb-2 text-sm text-gray-400">
              Horários disponíveis:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {horariosDisponiveis.map((h) => (
                <button
                  key={h}
                  onClick={() => setHora(h)}
                  className={`p-2 rounded ${
                    hora === h
                      ? "bg-blue-500"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={salvar}
          className="w-full bg-blue-500 py-3 rounded-lg"
        >
          Confirmar
        </button>

      </div>
    </div>
  )
}