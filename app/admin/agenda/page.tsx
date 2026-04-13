"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function AgendaPage() {
  const router = useRouter();

  const [consultas, setConsultas] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      fetchConsultas(user.id);
    }
    init();
  }, []);

  async function fetchConsultas(userId: string) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: true });

    if (error) {
      console.log("Erro ao buscar agendamentos", error);
    } else {
      setConsultas(data || []);
    }
    setIsLoading(false);
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status.");
      return;
    }

    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    setSelecionada(null); // Fecha o modal
  }

  const eventos = consultas.map((c) => ({
    id: String(c.id),
    title: `${c.nome} - ${c.hora}`,
    date: `${c.data}T${c.hora}`,
    backgroundColor:
      c.status === "confirmado"
        ? "#10b981" // emerald-500
        : c.status === "cancelado"
        ? "#ef4444" // red-500
        : "#eab308", // yellow-500
    borderColor: "transparent",
  }));

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight">Agenda</h1>
        <p className="text-slate-400 mt-1">Gerencie os agendamentos e horários.</p>
      </div>

      <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-4 shadow-sm flex-1 flex flex-col min-h-0">
        <div className="bg-[#020617] rounded-xl p-2 md:p-4 flex-1 overflow-auto text-slate-300 agenda-calendar-wrapper">
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
            height="100%"
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

      {/* MODAL */}
      <Modal 
        isOpen={!!selecionada} 
        onClose={() => setSelecionada(null)} 
        title="Detalhes do Agendamento"
      >
        {selecionada && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Paciente</p>
              <p className="text-lg font-bold text-white">{selecionada.nome}</p>
              <p className="text-sm text-slate-300">{selecionada.email || "Sem e-mail"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-sm text-slate-400 font-medium">Data</p>
                <p className="font-semibold text-white">{selecionada.data.split('-').reverse().join('/')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">Horário</p>
                <p className="font-semibold text-white">{selecionada.hora}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-400 font-medium mb-1">Status Atual</p>
              <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
                selecionada.status === "confirmado" ? "bg-emerald-500/20 text-emerald-400" :
                selecionada.status === "cancelado" ? "bg-red-500/20 text-red-400" :
                "bg-yellow-500/20 text-yellow-500"
              }`}>
                {selecionada.status?.toUpperCase() || "PENDENTE"}
              </span>
            </div>

            <div className="pt-4 mt-2 flex flex-col gap-3 border-t border-gray-800">
              <button
                onClick={() => atualizarStatus(selecionada.id, "confirmado")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                Confirmar Consulta
              </button>
              
              <button
                onClick={() => atualizarStatus(selecionada.id, "cancelado")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-red-400 font-semibold py-2.5 rounded-xl transition-colors"
              >
                Cancelar Agendamento
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Global styles fix for FullCalendar in dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .agenda-calendar-wrapper {
           --fc-border-color: #1e293b;
           --fc-button-text-color: #e2e8f0;
           --fc-button-bg-color: #0f172a;
           --fc-button-border-color: #334155;
           --fc-button-hover-bg-color: #1e293b;
           --fc-button-hover-border-color: #475569;
           --fc-button-active-bg-color: #334155;
           --fc-button-active-border-color: #475569;
           --fc-event-bg-color: #10b981;
           --fc-event-border-color: #10b981;
           --fc-today-bg-color: rgba(16, 185, 129, 0.05);
           --fc-page-bg-color: #020617;
           --fc-neutral-bg-color: #0f172a;
           --fc-list-event-hover-bg-color: #1e293b;
        }
        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #f8fafc; }
        .fc th { color: #94a3b8; font-weight: 500; font-size: 0.875rem; padding: 0.5rem 0;}
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color); }
        .fc .fc-button { border-radius: 0.5rem; text-transform: capitalize; }
      `}} />

    </div>
  );
}