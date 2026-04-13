"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"

export default function AdminPage() {
  const [consultas, setConsultas] = useState<any[]>([])
  const [selecionada, setSelecionada] = useState<any>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
    fetchConsultas()
  }, [])

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
      return
    }

    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    )
  }

  const eventos = consultas.map((c) => ({
    id: String(c.id),
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
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Agenda</h1>

      {/* 📅 CALENDÁRIO RESPONSIVO */}
      <div className="bg-white rounded-xl p-2 md:p-4 text-black mb-8 overflow-x-auto">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: isMobile
              ? ""
              : "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={eventos}
          height="auto"
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          allDaySlot={false}
          eventClick={(info) => {
            const consulta = consultas.find(
              (c) => String(c.id) === info.event.id
            )
            setSelecionada(consulta)
          }}
        />
      </div>

      {/* 📋 LISTA */}
      <div className="space-y-6">
        {consultas.map((c) => (
          <div
            key={c.id}
            className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl backdrop-blur-lg"
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

            {/* STATUS */}
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

            {/* RESUMO IA */}
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
            <div className="mt-4 flex flex-col md:flex-row gap-2">
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

      {/* 💥 MODAL RESPONSIVO */}
      {selecionada && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelecionada(null)}
        >
          <div
            className="bg-[#020617] p-6 rounded-xl w-[90%] max-w-md border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">
              {selecionada.nome}
            </h2>

            <p className="text-gray-300">{selecionada.email}</p>

            <p className="mt-2">
              📅 {selecionada.data} ⏰ {selecionada.hora}
            </p>

            <p className="mt-2">
              Prioridade: {selecionada.prioridade}
            </p>

            <p className="mt-2">
              Status: {selecionada.status}
            </p>

            {selecionada.sintomas && (
              <div className="mt-3 text-sm text-gray-300">
                {selecionada.sintomas}
              </div>
            )}

            {selecionada.resumo && (
              <div className="mt-3 text-sm text-blue-400">
                {selecionada.resumo}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={() => {
                  atualizarStatus(selecionada.id, "confirmado")
                  setSelecionada(null)
                }}
                className="bg-green-500 px-4 py-2 rounded"
              >
                Confirmar
              </button>

              <button
                onClick={() => {
                  atualizarStatus(selecionada.id, "cancelado")
                  setSelecionada(null)
                }}
                className="bg-red-500 px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>

            <button
              onClick={() => setSelecionada(null)}
              className="mt-4 text-gray-400 text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}