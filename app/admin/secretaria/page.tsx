"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";
import {
  Loader2, Plus, CalendarRange, Clock, User, Phone, PhoneOutgoing, Mail, FileText,
  CheckCircle2, XCircle, CalendarClock, UserCheck, ChevronLeft, ChevronRight,
  Stethoscope, AlertCircle, Lock
} from "lucide-react";

// Gerar slots de 30 min
function generateSlots() {
  const slots: string[] = [];
  for (let i = 8; i <= 18; i++) {
    slots.push(`${i.toString().padStart(2, "0")}:00`);
    slots.push(`${i.toString().padStart(2, "0")}:30`);
  }
  return slots;
}

export default function SecretariaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Médicos vinculados
  const [medicos, setMedicos] = useState<any[]>([]);
  const [selectedMedicoId, setSelectedMedicoId] = useState<string>("todos");

  // Agendamentos
  const [agendamentos, setAgendamentos] = useState<any[]>([]);

  // Data selecionada
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Modals
  const [selecionada, setSelecionada] = useState<any>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  // New appointment form
  const [newForm, setNewForm] = useState({
    nome: "", telefone: "", email: "", sintomas: "", observacoes_paciente: "",
    medicoId: "", hora: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reschedule form  
  const [rescheduleData, setRescheduleData] = useState({ data: "", hora: "" });

  // Init
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!prof || prof.role !== "secretaria") {
        router.push("/admin");
        return;
      }

      setProfile(prof);

      // Buscar médicos: prioridade clinica_id > medicos_ids (fallback)
      if (prof.clinica_id) {
        // Buscar todos os médicos da mesma clínica
        const { data: docs } = await supabase
          .from("profiles")
          .select("id, nome, especialidade, slug")
          .eq("clinica_id", prof.clinica_id)
          .eq("role", "doctor")
          .eq("status", "active");

        setMedicos(docs || []);
      } else {
        // Fallback: usar medicos_ids manual
        const medicoIds: string[] = prof.medicos_ids || [];
        if (medicoIds.length > 0) {
          const { data: docs } = await supabase
            .from("profiles")
            .select("id, nome, especialidade, slug")
            .in("id", medicoIds);

          setMedicos(docs || []);
        }
      }

      setLoading(false);
    }
    init();
  }, [router]);

  // Buscar agendamentos quando data ou médicos mudam
  useEffect(() => {
    if (medicos.length === 0 || !selectedDate) return;

    async function fetchAgendamentos() {
      const medicoIds = medicos.map(m => m.id);
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", medicoIds)
        .eq("data", selectedDate);

      if (!error && data) {
        setAgendamentos(data);
      }
    }
    fetchAgendamentos();
  }, [medicos, selectedDate]);

  // Médicos visíveis (filtrados)
  const medicosVisiveis = selectedMedicoId === "todos" 
    ? medicos 
    : medicos.filter((m: any) => m.id === selectedMedicoId);
  const slots = generateSlots();

  // Encontrar agendamento na célula
  function getAgendamento(medicoId: string, slot: string) {
    return agendamentos.find(
      a => a.user_id === medicoId && a.hora?.substring(0, 5) === slot
    );
  }

  // Ações
  async function atualizarStatus(id: number, status: string) {
    const actionMap: Record<string, string> = {
      confirmado: "confirmar",
      cancelado: "cancelar",
      presente: "presente"
    };

    const action = actionMap[status];

    if (action) {
      try {
        const res = await fetch("/api/agenda/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, id })
        });

        if (res.ok) {
          setAgendamentos(prev => prev.map(item => item.id === id ? { ...item, status } : item));
          setSelecionada(null);
        } else {
          alert(`Erro ao atualizar status: ${status}`);
        }
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro de conexão ao atualizar status.");
      }
      return;
    }

    // Para outros status (ex: bloqueado, falta), mantém a lógica direta se necessário,
    // mas o escopo do usuário pede migração de confirmar, cancelar, presente.
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status.");
      return;
    }

    setAgendamentos(prev =>
      prev.map(item => item.id === id ? { ...item, status } : item)
    );
    setSelecionada(null);
  }

  async function registrarTentativa(id: number, atual: number) {
    const novo = (atual || 0) + 1;
    const { error } = await supabase
      .from("agendamentos")
      .update({ tentativas_contato: novo })
      .eq("id", id);

    if (!error) {
      setAgendamentos(prev =>
        prev.map(item => item.id === id ? { ...item, tentativas_contato: novo } : item)
      );
      if (selecionada?.id === id) {
        setSelecionada({ ...selecionada, tentativas_contato: novo });
      }
    }
  }

  async function atualizarConfirmacao(id: number, confirmacao_status: string) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ confirmacao_status })
      .eq("id", id);

    if (!error) {
      setAgendamentos(prev =>
        prev.map(item => item.id === id ? { ...item, confirmacao_status } : item)
      );
      if (selecionada?.id === id) {
        setSelecionada({ ...selecionada, confirmacao_status });
      }
    }
  }

  async function criarConsulta(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const res = await fetch("/api/agenda/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: newForm.nome,
        email: newForm.email,
        telefone: newForm.telefone,
        data: selectedDate,
        hora: newForm.hora,
        sintomas: newForm.sintomas,
        observacoes_paciente: newForm.observacoes_paciente || null,
        status: "confirmado",
        user_id: newForm.medicoId,
        patient_id: null,
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Erro: ${err.error || "Erro ao criar consulta"}`);
    } else {
      // Refresh agenda
      setShowNewModal(false);
      setNewForm({ nome: "", telefone: "", email: "", sintomas: "", observacoes_paciente: "", medicoId: "", hora: "" });

      // Re-fetch
      const medicoIds = medicos.map(m => m.id);
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", medicoIds)
        .eq("data", selectedDate)
        .neq("status", "cancelado");

      setAgendamentos(data || []);
    }
    setIsSaving(false);
  }

  async function bloquearHorario() {
    setIsSaving(true);
    const res = await fetch("/api/agenda/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: "Horário Bloqueado",
        email: "",
        telefone: "",
        data: selectedDate,
        hora: newForm.hora,
        status: "bloqueado",
        user_id: newForm.medicoId,
        patient_id: null,
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Erro: ${err.error || "Erro ao bloquear horário"}`);
    } else {
      setShowNewModal(false);
      setNewForm({ nome: "", telefone: "", email: "", sintomas: "", observacoes_paciente: "", medicoId: "", hora: "" });

      // Re-fetch
      const medicoIds = medicos.map(m => m.id);
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", medicoIds)
        .eq("data", selectedDate)
        .neq("status", "cancelado");

      setAgendamentos(data || []);
    }
    setIsSaving(false);
  }


  async function reagendar(e: React.FormEvent) {
    e.preventDefault();
    if (!selecionada) return;
    setIsSaving(true);

    const res = await fetch("/api/agenda/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selecionada.id,
        nova_data: rescheduleData.data,
        nova_hora: rescheduleData.hora
      })
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Erro: ${err.error || "Erro ao reagendar."}`);
    } else {
      setShowRescheduleModal(false);
      setSelecionada(null);

      // Re-fetch
      const medicoIds = medicos.map(m => m.id);
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", medicoIds)
        .eq("data", selectedDate)
        .neq("status", "cancelado");

      setAgendamentos(data || []);
    }
    setIsSaving(false);
  }

  // Navegar data
  function changeDate(delta: number) {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split("T")[0]);
  }

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long"
  });

  // Toggling doctor filter (now handled via single select)

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Sem médicos vinculados
  if (medicos.length === 0) {
    return (
      <div className="p-6 md:p-10 flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto">
        <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 border border-amber-200">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">Nenhum Medico Vinculado</h2>
        <p className="text-slate-500 leading-relaxed">
          Sua conta de secretaria ainda nao esta vinculada a nenhum medico. 
          Peca ao administrador para adicionar os IDs dos medicos na sua coluna <code className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-xs">medicos_ids</code> na tabela profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full max-w-[1600px] mx-auto w-full overflow-hidden">

      {/* HEADER */}
      <div className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarRange className="w-7 h-7 text-blue-500" />
            Agenda Multi-Medicos
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie os horarios de todos os medicos da clinica.</p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold transition-all text-sm"
        >
          <Plus className="w-5 h-5" /> Nova Consulta
        </button>
      </div>

      {/* FILTROS */}
      <div className="mb-4 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Doctor filter chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMedicoId("todos")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${
              selectedMedicoId === "todos"
                ? "bg-slate-800 text-white border-slate-800 shadow-md"
                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            Todos os Médicos
          </button>

          {medicos.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedMedicoId(m.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                selectedMedicoId === m.id
                  ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                selectedMedicoId === m.id ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {m.nome?.charAt(0)}
              </div>
              <span className="hidden sm:inline">{m.nome}</span>
              <span className="sm:hidden">{m.nome?.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 cursor-pointer focus:border-blue-400 outline-none"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date display */}
      <p className="text-sm font-bold text-slate-500 mb-4 capitalize shrink-0">{displayDate}</p>

      {/* GRID MULTI-MÉDICOS */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col min-h-0">
        {/* Header colunas (medicos) */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
          <div className="w-20 sm:w-24 shrink-0 p-3 border-r border-slate-200 flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          {medicosVisiveis.map(m => (
            <div key={m.id} className="flex-1 min-w-[140px] sm:min-w-[180px] p-3 border-r border-slate-200 last:border-r-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-sm shrink-0">
                  {m.nome?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{m.nome}</p>
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider truncate">
                    {m.especialidade || "Clínico"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grid de horários */}
        <div className="flex-1 overflow-y-auto overflow-x-auto">
          {slots.map(slot => (
            <div key={slot} className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              {/* Horario */}
              <div className="w-20 sm:w-24 shrink-0 p-2 sm:p-3 border-r border-slate-200 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-400 font-mono">{slot}</span>
              </div>

              {/* Celulas por medico */}
              {medicosVisiveis.map(m => {
                const ag = getAgendamento(m.id, slot);
                return (
                  <div
                    key={`${m.id}-${slot}`}
                    className={`flex-1 min-w-[140px] sm:min-w-[180px] p-1.5 sm:p-2 border-r border-slate-100 last:border-r-0 min-h-[48px] ${
                      !ag ? "cursor-pointer hover:bg-blue-50/50" : ""
                    }`}
                    onClick={() => {
                      if (ag) {
                        setSelecionada(ag);
                      } else {
                        setNewForm({ ...newForm, medicoId: m.id, hora: slot });
                        setShowNewModal(true);
                      }
                    }}
                  >
                    {ag && (
                      <div className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between min-h-full ${
                        ag.status === "bloqueado"
                          ? "bg-slate-100 border-slate-200 text-slate-500"
                          : ag.status === "confirmado"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                          : ag.status === "presente"
                          ? "bg-sky-50 border-sky-200 text-sky-600"
                          : ag.status === "cancelado"
                          ? "bg-red-50 border-red-200 text-red-600"
                          : "bg-amber-50 border-amber-200 text-amber-600"
                      }`}>
                        {ag.status === "bloqueado" ? (
                           <div 
                             className="flex flex-col items-center justify-center h-full text-slate-400 gap-1"
                             onClick={(e) => { e.stopPropagation(); atualizarStatus(ag.id, "cancelado") }}
                             title="Clique para desbloquear"
                           >
                              <Lock className="w-4 h-4 mb-0.5 opacity-60" />
                              <span className="font-bold text-[10px] uppercase tracking-wider">Indisponível</span>
                           </div>
                        ) : (
                           <>
                              <div>
                                <p className="font-bold truncate">{ag.nome}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[10px] opacity-70 uppercase font-semibold">{ag.status}</span>
                                  {(ag.tentativas_contato || 0) > 0 && (
                                    <span className="text-[9px] font-mono opacity-60">{ag.tentativas_contato}x</span>
                                  )}
                                </div>
                                {/* Confirmação Badge */}
                                <div className="mt-1.5">
                                  <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                    ag.confirmacao_status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
                                    ag.confirmacao_status === "enviado" ? "bg-blue-100 text-blue-700" :
                                    ag.confirmacao_status === "sem_resposta" ? "bg-amber-100 text-amber-700" :
                                    "bg-slate-200 text-slate-500"
                                  }`}>
                                    💬 {
                                      ag.confirmacao_status === "sem_resposta" ? "S/ RESPOSTA" : 
                                      ag.confirmacao_status === "confirmado" ? "CONFIRMOU" :
                                      ag.confirmacao_status === "enviado" ? "ENVIADO" : "PENDENTE"
                                    }
                                  </span>
                                </div>
                              </div>

                              {/* AÇÕES DIRETA NA GRID */}
                              {ag.status !== "cancelado" && ag.status !== "presente" && (
                                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-black/5" onClick={(e) => e.stopPropagation()}>
                                  {ag.status !== "confirmado" && (
                                    <button
                                      onClick={() => atualizarStatus(ag.id, "confirmado")}
                                      className="flex-1 flex justify-center items-center bg-emerald-500 hover:bg-emerald-600 text-white py-1.5 rounded transition-colors shadow-sm"
                                      title="Confirmar"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => atualizarStatus(ag.id, "presente")}
                                    className="flex-1 flex justify-center items-center bg-sky-500 hover:bg-sky-600 text-white py-1.5 rounded transition-colors shadow-sm"
                                    title="Presente (Check-in)"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => atualizarStatus(ag.id, "cancelado")}
                                    className="flex-1 flex justify-center items-center bg-red-400 hover:bg-red-500 text-white py-1.5 rounded transition-colors shadow-sm"
                                    title="Cancelar"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                           </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: Detalhes do Agendamento */}
      <Modal
        isOpen={!!selecionada && !showRescheduleModal}
        onClose={() => setSelecionada(null)}
        title="Detalhes do Agendamento"
      >
        {selecionada && (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Paciente</p>
              <p className="text-lg font-bold text-slate-800">{selecionada.nome}</p>
              <p className="text-sm text-slate-500">{selecionada.email || "Sem e-mail"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm text-slate-400 font-medium">Data e Horario</p>
                <p className="font-semibold text-slate-800">
                  {selecionada.data?.split("-").reverse().join("/")} as {selecionada.hora}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">WhatsApp</p>
                <p className="font-semibold text-slate-800">{selecionada.telefone || "Nao informado"}</p>
              </div>
            </div>

            {(selecionada.sintomas || selecionada.observacoes_paciente) && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <p className="text-sm text-blue-500 font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Informacoes do Paciente
                </p>
                {selecionada.sintomas && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Motivo da consulta</p>
                    <p className="text-sm text-slate-700">{selecionada.sintomas}</p>
                  </div>
                )}
                {selecionada.observacoes_paciente && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Observacoes do paciente</p>
                    <p className="text-sm text-slate-600">{selecionada.observacoes_paciente}</p>
                  </div>
                )}
              </div>
            )}

            {/* Médico responsável */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Medico Responsavel</p>
                <p className="text-sm font-bold text-slate-800">
                  {medicos.find((m: any) => m.id === selecionada.user_id)?.nome || "Desconhecido"}
                </p>
              </div>
            </div>

            {/* Status Geral */}
            <div className="pt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-400 font-medium mb-1">Status da Consulta</p>
                <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
                  selecionada.status === "confirmado" ? "bg-emerald-50 text-emerald-600" :
                  selecionada.status === "presente" ? "bg-sky-50 text-sky-600" :
                  selecionada.status === "cancelado" ? "bg-red-50 text-red-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  {selecionada.status?.toUpperCase() || "PENDENTE"}
                </span>
              </div>
            </div>

            {/* Confirmação Paciente (Mensagens) */}
            <div className="pt-4 border-t border-slate-100 mt-2">
              <p className="text-sm text-slate-400 font-medium mb-2 flex items-center gap-1">
                💬 Resposta do Paciente
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => atualizarConfirmacao(selecionada.id, "pendente")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${(!selecionada.confirmacao_status || selecionada.confirmacao_status === "pendente") ? "bg-slate-200 text-slate-700" : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50"}`}
                >Pendente</button>
                <button 
                  onClick={() => atualizarConfirmacao(selecionada.id, "enviado")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selecionada.confirmacao_status === "enviado" ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300" : "bg-white border border-slate-200 text-slate-400 hover:bg-blue-50 hover:text-blue-600"}`}
                >Lembrete Enviado</button>
                <button 
                  onClick={() => atualizarConfirmacao(selecionada.id, "confirmado")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selecionada.confirmacao_status === "confirmado" ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" : "bg-white border border-slate-200 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"}`}
                >Paciente Confirmou</button>
                <button 
                  onClick={() => atualizarConfirmacao(selecionada.id, "sem_resposta")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${selecionada.confirmacao_status === "sem_resposta" ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300" : "bg-white border border-slate-200 text-slate-400 hover:bg-amber-50 hover:text-amber-600"}`}
                >Sem Resposta</button>
              </div>
            </div>

            {/* Ações */}
            <div className="pt-4 mt-2 flex flex-col gap-2.5 border-t border-slate-200">
              <button
                onClick={() => atualizarStatus(selecionada.id, "presente")}
                className="w-full flex justify-center items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-xl transition-colors"
              >
                <UserCheck className="w-5 h-5" /> Marcar Presenca
              </button>

              <button
                onClick={() => atualizarStatus(selecionada.id, "confirmado")}
                className="w-full bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-emerald-600 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Confirmar</span>
              </button>

              <button
                onClick={() => {
                  setRescheduleData({ data: selecionada.data, hora: selecionada.hora });
                  setShowRescheduleModal(true);
                }}
                className="w-full bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-amber-600 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><CalendarClock className="w-4 h-4" /> Reagendar</span>
              </button>

              <button
                onClick={() => atualizarStatus(selecionada.id, "cancelado")}
                className="w-full bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-500 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Cancelar</span>
              </button>

              <button
                onClick={() => registrarTentativa(selecionada.id, selecionada.tentativas_contato || 0)}
                className="w-full flex justify-center items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors active:scale-[0.98]"
              >
                <PhoneOutgoing className="w-4 h-4" />
                Registrar Tentativa
                <span className="text-xs font-mono text-slate-500 ml-1">({selecionada.tentativas_contato || 0})</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: Nova Consulta Manual */}
      <Modal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        title="Nova Consulta Manual"
      >
        <form onSubmit={criarConsulta} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
              <User className="w-4 h-4 text-emerald-500" /> Paciente
            </label>
            <input
              placeholder="Nome completo do paciente"
              required
              value={newForm.nome}
              onChange={(e) => setNewForm({ ...newForm, nome: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none transition-colors text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
                <Phone className="w-4 h-4 text-emerald-500" /> Telefone
              </label>
              <input
                placeholder="(11) 99999-9999"
                value={newForm.telefone}
                onChange={(e) => setNewForm({ ...newForm, telefone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none transition-colors text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
                <Mail className="w-4 h-4 text-emerald-500" /> Email
              </label>
              <input
                type="email"
                placeholder="email@paciente.com"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none transition-colors text-sm"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
              <Stethoscope className="w-4 h-4 text-emerald-500" /> Médico
            </label>
            <select
              required
              value={newForm.medicoId}
              onChange={(e) => setNewForm({ ...newForm, medicoId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-blue-400 outline-none transition-colors text-sm"
            >
              <option value="">Selecione o médico</option>
              {medicos.map(m => (
                <option key={m.id} value={m.id}>{m.nome} — {m.especialidade || "Clínico"}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
                <CalendarRange className="w-4 h-4 text-emerald-500" /> Data
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                readOnly
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
                <Clock className="w-4 h-4 text-emerald-500" /> Horário
              </label>
              <select
                required
                value={newForm.hora}
                onChange={(e) => setNewForm({ ...newForm, hora: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-blue-400 outline-none transition-colors text-sm"
              >
                <option value="">Selecionar</option>
                {generateSlots().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
              <FileText className="w-4 h-4 text-emerald-500" /> Observações
            </label>
            <textarea
              placeholder="Motivo ou observação da consulta..."
              value={newForm.sintomas}
              onChange={(e) => setNewForm({ ...newForm, sintomas: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none transition-colors text-sm min-h-[80px] resize-y"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-400 mb-1.5">
              <Stethoscope className="w-4 h-4 text-slate-400" /> Observacoes adicionais <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md ml-1">Opcional</span>
            </label>
            <textarea
              placeholder="Medicamentos, alergias, informacoes relevantes..."
              value={newForm.observacoes_paciente}
              onChange={(e) => setNewForm({ ...newForm, observacoes_paciente: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-slate-300 outline-none transition-colors text-sm min-h-[60px] resize-y"
            />
          </div>

          <div className="flex gap-3">
             <button
                type="button"
                onClick={bloquearHorario}
                disabled={isSaving || !newForm.hora || !newForm.medicoId}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
             >
                <Lock className="w-4 h-4" /> Bloquear Horário
             </button>

             <button
               type="submit"
               disabled={isSaving}
               className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
             >
               {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Plus className="w-4 h-4" /> Criar Agendamento</>}
             </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: Reagendar */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reagendar Consulta"
      >
        {selecionada && (
          <form onSubmit={reagendar} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <p className="text-sm text-slate-400 mb-1">Paciente</p>
              <p className="text-slate-800 font-bold">{selecionada.nome}</p>
              <p className="text-xs text-slate-500 mt-1">
                Horário atual: {selecionada.data?.split("-").reverse().join("/")} às {selecionada.hora}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-slate-400 mb-1.5 block">Nova Data</label>
                <input
                  type="date"
                  required
                  value={rescheduleData.data}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, data: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-amber-400 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-1.5 block">Novo Horário</label>
                <select
                  required
                  value={rescheduleData.hora}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, hora: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 focus:border-amber-400 outline-none transition-colors text-sm"
                >
                  <option value="">Selecionar</option>
                  {generateSlots().map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Reagendando...</> : <><CalendarClock className="w-4 h-4" /> Confirmar Reagendamento</>}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
