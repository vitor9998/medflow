"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"

export default function AdminPage() {
  const [consultas, setConsultas] = useState<any[]>([])

  async function fetchConsultas() {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })

    if (error) {
      console.log("Erro ao buscar:", error)
      return
    }

    setConsultas(data || [])
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id)

    if (error) {
      alert("Erro ao atualizar status")
      console.log(error)
      return
    }

    // Atualiza na tela sem reload
    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    )
  }

  useEffect(() => {
    fetchConsultas()
  }, [])

  // 🎨 EVENTOS COM COR (STATUS)
  const eventos = consultas.map((c) => ({
    title: `${c.nome} - ${c.hora}`,
    date: `${c.data}T${c.hora}`,
    backgroundColor:
      c.status === "confirmado"
        ? "#22c55e"
        : c.status === "cancelado"
        ? "#ef4444"
        : "#facc15",
    borderColor: "transparent",
  }))

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Agenda</h1>

      {/* 📅 CALENDÁRIO */}
      <div className="bg-white rounded-xl p-4 text-black mb-8">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={eventos}
          height="auto"
        />
      </div>

      {/* 📋 LISTA */}
      <div className="space-y-6">
        {consultas.map((c) => (
          <div
            key={c.id}
            className="bg-white/5 border border-white/10 p-6 rounded-xl backdrop-blur-lg"
          >
            <h2 className="text-lg font-semibold">{c.nome}</h2>
            <p className="text-gray-300">{c.email}</p>

            <p className="text-sm mt-2">
              📅 {c.data} ⏰ {c.hora}
            </p>

            {/* PRIORIDADE */}
            <p
              className={`mt-2 font-bold ${
                c.prioridade === "urgente"
                  ? "text-red-400"
                  : c.prioridade === "moderado"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {c.prioridade?.toUpperCase()}
            </p>

            {/* ✅ STATUS BADGE PREMIUM */}
            <p
              className={`mt-2 px-3 py-1 rounded-full text-sm w-fit font-semibold ${
                c.status === "confirmado"
                  ? "bg-green-500/20 text-green-400"
                  : c.status === "cancelado"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {c.status}
            </p>

            {/* 🤖 RESUMO IA */}
            {c.resumo && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                <p className="text-blue-400 text-sm font-semibold">
                  Resumo IA:
                </p>
                <p className="text-sm mt-1">{c.resumo}</p>
              </div>
            )}

            {/* SINTOMAS */}
            {c.sintomas && (
              <div className="mt-3 bg-white/5 p-4 rounded-lg text-sm text-gray-300">
                <strong>Sintomas:</strong>
                <p className="mt-1">{c.sintomas}</p>
              </div>
            )}

            {/* BOTÕES */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => atualizarStatus(c.id, "confirmado")}
                className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Confirmar
              </button>

              <button
                onClick={() => atualizarStatus(c.id, "cancelado")}
                className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition"
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