"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { MessageCircle, BrainCircuit, Save, Activity } from "lucide-react";

export default function AgendaPage() {
  const router = useRouter();

  const [consultas, setConsultas] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // EHR States
  const [obsText, setObsText] = useState("");
  const [diagnosticoText, setDiagnosticoText] = useState("");
  const [iaSummary, setIaSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSavingEhr, setIsSavingEhr] = useState(false);

  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (selecionada) {
       setObsText(selecionada.observacoes_medico || "");
       setDiagnosticoText(selecionada.diagnostico_final || "");
       setIaSummary(selecionada.resumo_ia || "");
    }
  }, [selecionada]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const currentIsMobile = window.innerWidth < 768;
      setIsMobile(currentIsMobile);
      
      // Força a atualização do calendário se ele já montou
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(currentIsMobile ? "timeGridDay" : "timeGridWeek");
      }

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

  const enviarWhatsApp = (consulta: any) => {
    const dataBr = consulta.data.split('-').reverse().join('/');
    const msg = `Olá, ${consulta.nome}! Tudo bem? Apenas passando para lembrar e confirmar o seu agendamento médico no dia *${dataBr}* às *${consulta.hora}*. Podemos confirmar sua presença?`;
    const foneLimpo = consulta.telefone ? consulta.telefone.replace(/\D/g, '') : '';
    const prefixo = foneLimpo.length <= 11 ? '55' : ''; // Brasil default fallback
    const url = `https://wa.me/${prefixo}${foneLimpo}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  async function salvarProntuario() {
    setIsSavingEhr(true);
    const { error } = await supabase
      .from("agendamentos")
      .update({ 
         observacoes_medico: obsText, 
         diagnostico_final: diagnosticoText,
         resumo_ia: iaSummary
      })
      .eq("id", selecionada.id);
      
    if (error) {
      alert("Erro ao gravar prontuário no banco.");
    } else {
      // Atualiza o estado local para não perder
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === selecionada.id ? { ...item, observacoes_medico: obsText, diagnostico_final: diagnosticoText, resumo_ia: iaSummary } : item
        )
      );
      alert("Prontuário Médico salvo e ancorado com sucesso!");
    }
    setIsSavingEhr(false);
  }

  async function gerarResumoIA() {
     setIsAiLoading(true);
     // Simula a requisição externa à API da OpenAI (Fase 4 - Mock Módulo)
     setTimeout(() => {
       const mockSummary = `🩺 **Resumo Clínico Gerado por IA:** \nPaciente apresenta quadro onde a queixa inicial foi: "${selecionada.sintomas}". \n\nDurante a anamnese, o profissional reportou: "${obsText}". \n\n**A hipótese diagnóstica firmada:** ${diagnosticoText || 'Não classificada'}. \n\nRecomenda-se acompanhamento padrão conforme diretrizes aplicáveis.`;
       setIaSummary(mockSummary);
       setIsAiLoading(false);
     }, 2000);
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
    <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full overflow-hidden">
      
      <div className="mb-4 sm:mb-6 shrink-0 mt-2 sm:mt-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Agenda</h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">Gerencie os agendamentos e horários da clínica.</p>
      </div>

      <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-2 sm:p-4 shadow-sm flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-[#020617] rounded-xl p-1 sm:p-4 flex-1 overflow-x-auto overflow-y-hidden text-slate-300 w-full relative agenda-calendar-wrapper">
          <div className="min-w-full h-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              initialView="timeGridWeek" // Default, alterado no useEffect
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: isMobile 
                  ? "listMonth,timeGridWeek,timeGridDay" 
                  : "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                listMonth: "mês",
                dayGridMonth: "mês",
                timeGridWeek: "semana",
                timeGridDay: "dia",
                today: "hoje"
              }}
              windowResizeDelay={100}
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
                <p className="text-sm text-slate-400 font-medium">Data e Horário</p>
                <p className="font-semibold text-white">{selecionada.data.split('-').reverse().join('/')} às {selecionada.hora}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">WhatsApp</p>
                <p className="font-semibold text-white">{selecionada.telefone || "Não informado"}</p>
              </div>
            </div>

            {/* Triagem do Paciente */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="flex items-center gap-2 text-sm text-emerald-400 font-bold mb-1"><Activity className="w-4 h-4"/> Triagem do Paciente</p>
              <p className="text-sm text-slate-300 italic">"{selecionada.sintomas || "Nenhum sintoma relatado previamente."}"</p>
            </div>

            {/* EHR AREA */}
            <div className="border border-indigo-500/30 bg-indigo-900/10 p-4 rounded-xl space-y-4">
              <h3 className="font-bold text-indigo-400 border-b border-indigo-500/20 pb-2 mb-2 flex justify-between items-center">
                📋 Prontuário Médico
                <span className="text-[10px] uppercase bg-indigo-500/20 px-2 py-0.5 rounded-full">Anamnese & Diagnóstico</span>
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Observações da Consulta</label>
                <textarea 
                  value={obsText}
                  onChange={e => setObsText(e.target.value)}
                  placeholder="Relate os achados do exame clínico, pressão, queixas e orientações..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">C.I.D. ou Diagnóstico Final</label>
                <input 
                  value={diagnosticoText}
                  onChange={e => setDiagnosticoText(e.target.value)}
                  type="text"
                  placeholder="Ex: J01 - Sinusite aguda"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* MÓDULO INTELIGÊNCIA ARTIFICIAL */}
              <div className="bg-[#020617] rounded-xl p-4 border border-slate-800 mt-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-8 blur-2xl opacity-10 bg-indigo-500 rounded-full"></div>
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-3">
                     <p className="text-sm font-semibold text-indigo-300 flex items-center gap-2">
                       <BrainCircuit className="w-4 h-4" /> Resumo Clínico (Medsys AI)
                     </p>
                     <button 
                       onClick={gerarResumoIA}
                       disabled={isAiLoading || (!obsText && !selecionada.sintomas)}
                       className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-1.5 px-3 rounded-md transition-colors"
                     >
                       {isAiLoading ? "Processando..." : "Mágico: Gerar IA"}
                     </button>
                   </div>
                   
                   {iaSummary ? (
                     <div className="bg-indigo-950/40 border border-indigo-900/50 p-3 rounded-lg text-xs leading-relaxed text-indigo-100 whitespace-pre-wrap">
                       {iaSummary}
                     </div>
                   ) : (
                     <p className="text-xs text-slate-500 italic">O resumo autogerado aparecerá aqui quando solicitado.</p>
                   )}
                 </div>
              </div>
              
              <button
                onClick={salvarProntuario}
                disabled={isSavingEhr}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-3 mt-2 rounded-lg transition-colors shadow-lg shadow-indigo-600/20"
              >
                <Save className="w-4 h-4" /> {isSavingEhr ? "Salvando..." : "Arquivar Prontuário"}
              </button>
            </div>

            <div className="pt-2 mt-2">
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
                onClick={() => enviarWhatsApp(selecionada)}
                className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="w-5 h-5" />
                Lembrete via WhatsApp
              </button>

              <button
                onClick={() => atualizarStatus(selecionada.id, "confirmado")}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold py-2.5 rounded-xl transition-colors"
              >
                Confirmar no Sistema
              </button>
              
              <button
                onClick={() => atualizarStatus(selecionada.id, "cancelado")}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-semibold py-2.5 rounded-xl transition-colors"
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

        /* Responsive fixes */
        .fc-header-toolbar {
           flex-wrap: wrap;
           gap: 0.5rem;
           margin-bottom: 1rem !important;
        }

        @media (max-width: 640px) {
           .fc-toolbar-title { font-size: 1.1rem !important; }
           .fc .fc-toolbar { flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
           .fc-toolbar-chunk:first-child { display: flex; width: 100%; justify-content: space-between; }
           .fc-toolbar-chunk:nth-child(2) { text-align: center; }
           .fc-header-toolbar { padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
           .fc-view-harness { min-height: 500px; }
        }

        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #f8fafc; }
        .fc th { color: #94a3b8; font-weight: 500; font-size: 0.8rem; padding: 0.5rem 0; text-transform: uppercase; letter-spacing: 0.5px;}
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color); }
        .fc .fc-button { border-radius: 0.5rem; text-transform: capitalize; padding: 0.4rem 0.8rem; font-size: 0.875rem;}
        .fc-timegrid-slot-label { font-size: 0.75rem; color: #64748b; }
      `}} />

    </div>
  );
}