"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import {
  Calendar,
  dateFnsLocalizer,
} from "react-big-calendar"
import "react-big-calendar/lib/css/react-big-calendar.css"

import format from "date-fns/format"
import parse from "date-fns/parse"
import startOfWeek from "date-fns/startOfWeek"
import getDay from "date-fns/getDay"
import ptBR from "date-fns/locale/pt-BR"

const locales = {
  "pt-BR": ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("*")

    setAgendamentos(data || [])
  }

  const atualizarStatus = async (id: string, status: string) => {
    await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)

    setAgendamentos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    )
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const corStatusTexto = (status: string) => {
    if (status === "confirmado") return "text-green-400"
    if (status === "cancelado") return "text-red-400"
    return "text-yellow-400"
  }

  // EVENTOS COM DATA + HORA
  const eventos = agendamentos.map((item) => ({
    title: `${item.nome} - ${item.hora}`,
    start: new Date(`${item.data}T${item.hora}`),
    end: new Date(`${item.data}T${item.hora}`),
    status: item.status,
  }))

  // CORES DO CALENDÁRIO
  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#facc15"

    if (event.status === "confirmado") {
      backgroundColor = "#22c55e"
    }

    if (event.status === "cancelado") {
      backgroundColor = "#ef4444"
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        color: "white",
        border: "none",
      },
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agenda</h1>

        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      {/* CALENDÁRIO */}
      <div className="bg-white rounded-xl p-4 text-black h-[60vh] mb-6">
        <Calendar
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          style={{ height: "100%" }}
        />
      </div>

      {/* LISTA COM AÇÕES */}
      <div className="space-y-4">

        {agendamentos.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-lg">{item.nome}</p>
              <p className="text-sm text-gray-400">{item.email}</p>
              <p className="text-sm">📅 {item.data}</p>
              <p className="text-sm">⏰ {item.hora}</p>

              <p className={`mt-2 font-semibold ${corStatusTexto(item.status)}`}>
                {item.status}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  atualizarStatus(item.id, "confirmado")
                }
                className="bg-green-500 hover:bg-green-600 px-3 py-2 rounded-lg text-sm"
              >
                Confirmar
              </button>

              <button
                onClick={() =>
                  atualizarStatus(item.id, "cancelado")
                }
                className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}