"use client";

import Dashboard from "@/components/Dashboard";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function AdminPage() {
  const router = useRouter();

  const [consultas, setConsultas] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 🔒 PROTEÇÃO + LOAD
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setIsMobile(window.innerWidth < 768);
      fetchConsultas();
    }

    init();
  }, []);

  async function fetchConsultas() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: true });

    if (error) {
      console.log("Erro ao buscar:", error);
      return;
    }

    setConsultas(data || []);
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status");
      return;
    }

    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
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
  }));

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">

      {/* 🔥 DASHBOARD (NOVO) */}
      <Dashboard />

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Agenda</h1>
        <p className="text-gray-400 mt-2">
          Gerencie suas consultas de forma simples
        </p>
      </div>

      {/* CALENDÁRIO */}
      <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-4 shadow-xl mb-10">
        <div className="bg-white rounded-xl p-2 md:p-4 text-black overflow-x-auto">
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
              );
              setSelecionada(consulta);
            }}
          />
        </div>
      </div>

      {/* LISTA */}
      <div className="space-y-6">
        {consultas.map((c) => (
          <div
            key={c.id}
            className="bg-[#0B1120] border border-gray-800 p-6 rounded-2xl"
          >
            <h2 className="text-xl font-semibold">{c.nome}</h2>
            <p className="text-gray-400">{c.email}</p>

            <p className="text-sm mt-3 text-gray-300">
              📅 {c.data} ⏰ {c.hora}
            </p>

            <p
              className={`mt-2 font-semibold ${
                c.prioridade === "urgente"
                  ? "text-red-400"
                  : c.prioridade === "moderado"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {c.prioridade?.toUpperCase()}
            </p>

            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                c.status === "confirmado"
                  ? "bg-green-500/20 text-green-400"
                  : c.status === "cancelado"
                  ? "bg-red-500/20 text-red-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {c.status}
            </span>

            {c.resumo && (
              <div className="mt-4 bg-blue-500/10 border border-blue-500/30 p-4 rounded-xl">
                <p className="text-blue-400 text-sm font-semibold">
                  Resumo IA
                </p>
                <p className="text-sm mt-1">{c.resumo}</p>
              </div>
            )}

            {c.sintomas && (
              <div className="mt-3 bg-white/5 p-4 rounded-xl text-sm text-gray-300">
                <strong>Sintomas:</strong>
                <p className="mt-1">{c.sintomas}</p>
              </div>
            )}

            <div className="mt-5 flex flex-col md:flex-row gap-2">
              <button
                onClick={() => atualizarStatus(c.id, "confirmado")}
                className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
              >
                Confirmar
              </button>

              <button
                onClick={() => atualizarStatus(c.id, "cancelado")}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>

              <a
                href={`https://wa.me/55${c.telefone}?text=${encodeURIComponent(
                  `Olá ${c.nome}, sua consulta está ${c.status}.
Data: ${c.data} às ${c.hora}.`
                )}`}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-center"
              >
                WhatsApp
              </a>

              <a
                href={`https://wa.me/55${c.telefone}?text=${encodeURIComponent(
                  `Olá ${c.nome}, lembrando da sua consulta amanhã às ${c.hora}.`
                )}`}
                target="_blank"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-center"
              >
                Lembrete
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selecionada && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelecionada(null)}
        >
          <div
            className="bg-[#0B1120] p-6 rounded-2xl w-[90%] max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-2">
              {selecionada.nome}
            </h2>

            <p className="text-gray-400">{selecionada.email}</p>

            <p className="mt-3">
              📅 {selecionada.data} ⏰ {selecionada.hora}
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => {
                  atualizarStatus(selecionada.id, "confirmado");
                  setSelecionada(null);
                }}
                className="bg-green-500 px-4 py-2 rounded-lg"
              >
                Confirmar
              </button>

              <button
                onClick={() => {
                  atualizarStatus(selecionada.id, "cancelado");
                  setSelecionada(null);
                }}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                Cancelar
              </button>
            </div>

            <button
              onClick={() => setSelecionada(null)}
              className="mt-4 text-gray-500 text-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}