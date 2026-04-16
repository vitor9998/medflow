"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";
import {
  Loader2, Plus, CalendarRange, Clock, User, Phone, Mail, FileText,
  CheckCircle2, XCircle, CalendarClock, UserCheck, ChevronLeft, ChevronRight,
  Stethoscope, AlertCircle
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
  const [selectedMedicos, setSelectedMedicos] = useState<string[]>([]);

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
    nome: "", telefone: "", email: "", sintomas: "",
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

      // Buscar médicos vinculados
      const medicoIds: string[] = prof.medicos_ids || [];
      if (medicoIds.length > 0) {
        const { data: docs } = await supabase
          .from("profiles")
          .select("id, nome, especialidade, slug")
          .in("id", medicoIds);

        setMedicos(docs || []);
        setSelectedMedicos(medicoIds);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  // Buscar agendamentos quando data ou médicos mudam
  useEffect(() => {
    if (selectedMedicos.length === 0 || !selectedDate) return;

    async function fetchAgendamentos() {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", selectedMedicos)
        .eq("data", selectedDate)
        .neq("status", "cancelado");

      if (!error && data) {
        setAgendamentos(data);
      }
    }
    fetchAgendamentos();
  }, [selectedMedicos, selectedDate]);

  // Médicos visíveis (filtrados)
  const medicosVisiveis = medicos.filter(m => selectedMedicos.includes(m.id));
  const slots = generateSlots();

  // Encontrar agendamento na célula
  function getAgendamento(medicoId: string, slot: string) {
    return agendamentos.find(
      a => a.user_id === medicoId && a.hora?.substring(0, 5) === slot
    );
  }

  // Ações
  async function atualizarStatus(id: number, status: string) {
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

  async function criarConsulta(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase.from("agendamentos").insert([{
      nome: newForm.nome,
      email: newForm.email,
      telefone: newForm.telefone,
      data: selectedDate,
      hora: newForm.hora,
      sintomas: newForm.sintomas,
      status: "confirmado",
      user_id: newForm.medicoId,
      patient_id: null,
    }]);

    if (error) {
      alert(`Erro: ${error.message}`);
    } else {
      // Refresh agenda
      setShowNewModal(false);
      setNewForm({ nome: "", telefone: "", email: "", sintomas: "", medicoId: "", hora: "" });

      // Re-fetch
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", selectedMedicos)
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

    const { error } = await supabase
      .from("agendamentos")
      .update({ data: rescheduleData.data, hora: rescheduleData.hora })
      .eq("id", selecionada.id);

    if (error) {
      alert("Erro ao reagendar.");
    } else {
      setShowRescheduleModal(false);
      setSelecionada(null);

      // Re-fetch
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .in("user_id", selectedMedicos)
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

  // Toggling doctor filter
  function toggleMedico(id: string) {
    setSelectedMedicos(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  }

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
        <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Nenhum Médico Vinculado</h2>
        <p className="text-slate-400 leading-relaxed">
          Sua conta de secretária ainda não está vinculada a nenhum médico. 
          Peça ao administrador para adicionar os IDs dos médicos na sua coluna <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-xs">medicos_ids</code> na tabela profiles.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full max-w-[1600px] mx-auto w-full overflow-hidden">

      {/* HEADER */}
      <div className="mb-6 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <CalendarRange className="w-7 h-7 text-emerald-400" />
            Agenda Multi-Médicos
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Gerencie os horários de todos os médicos da clínica.</p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 text-sm"
        >
          <Plus className="w-5 h-5" /> Nova Consulta
        </button>
      </div>

      {/* FILTROS */}
      <div className="mb-4 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Doctor filter chips */}
        <div className="flex flex-wrap gap-2">
          {medicos.map(m => (
            <button
              key={m.id}
              onClick={() => toggleMedico(m.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
                selectedMedicos.includes(m.id)
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-slate-800/50 text-slate-500 border-slate-700 hover:text-slate-300"
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-extrabold ${
                selectedMedicos.includes(m.id) ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-400"
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
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white cursor-pointer focus:border-emerald-500 outline-none"
            />
          </div>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Date display */}
      <p className="text-sm font-bold text-slate-500 mb-4 capitalize shrink-0">{displayDate}</p>

      {/* GRID MULTI-MÉDICOS */}
      <div className="flex-1 bg-[#0B1120] border border-gray-800 rounded-2xl overflow-hidden flex flex-col min-h-0">
        {/* Header colunas (médicos) */}
        <div className="flex border-b border-gray-800 shrink-0 bg-[#020617]/80">
          <div className="w-20 sm:w-24 shrink-0 p-3 border-r border-gray-800 flex items-center justify-center">
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          {medicosVisiveis.map(m => (
            <div key={m.id} className="flex-1 min-w-[140px] sm:min-w-[180px] p-3 border-r border-gray-800 last:border-r-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                  {m.nome?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{m.nome}</p>
                  <p className="text-[10px] text-emerald-500 font-semibold uppercase tracking-wider truncate">
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
            <div key={slot} className="flex border-b border-gray-800/50 hover:bg-slate-800/20 transition-colors">
              {/* Horário */}
              <div className="w-20 sm:w-24 shrink-0 p-2 sm:p-3 border-r border-gray-800 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500 font-mono">{slot}</span>
              </div>

              {/* Células por médico */}
              {medicosVisiveis.map(m => {
                const ag = getAgendamento(m.id, slot);
                return (
                  <div
                    key={`${m.id}-${slot}`}
                    className={`flex-1 min-w-[140px] sm:min-w-[180px] p-1.5 sm:p-2 border-r border-gray-800/50 last:border-r-0 min-h-[48px] ${
                      !ag ? "cursor-pointer hover:bg-emerald-500/5" : ""
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
                      <div className={`p-2 rounded-lg border text-xs cursor-pointer transition-all hover:scale-[1.02] ${
                        ag.status === "confirmado"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : ag.status === "presente"
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                      }`}>
                        <p className="font-bold truncate">{ag.nome}</p>
                        <p className="text-[10px] opacity-70 uppercase font-semibold mt-0.5">{ag.status}</p>
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
              <p className="text-lg font-bold text-white">{selecionada.nome}</p>
              <p className="text-sm text-slate-300">{selecionada.email || "Sem e-mail"}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-gray-800">
              <div>
                <p className="text-sm text-slate-400 font-medium">Data e Horário</p>
                <p className="font-semibold text-white">
                  {selecionada.data?.split("-").reverse().join("/")} às {selecionada.hora}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">WhatsApp</p>
                <p className="font-semibold text-white">{selecionada.telefone || "Não informado"}</p>
              </div>
            </div>

            {selecionada.sintomas && (
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-sm text-emerald-400 font-bold mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Queixa
                </p>
                <p className="text-sm text-slate-300 italic">"{selecionada.sintomas}"</p>
              </div>
            )}

            {/* Médico responsável */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-gray-800 flex items-center gap-3">
              <Stethoscope className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Médico Responsável</p>
                <p className="text-sm font-bold text-white">
                  {medicos.find(m => m.id === selecionada.user_id)?.nome || "Desconhecido"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="pt-2">
              <p className="text-sm text-slate-400 font-medium mb-1">Status Atual</p>
              <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold ${
                selecionada.status === "confirmado" ? "bg-emerald-500/20 text-emerald-400" :
                selecionada.status === "presente" ? "bg-blue-500/20 text-blue-400" :
                selecionada.status === "cancelado" ? "bg-red-500/20 text-red-400" :
                "bg-yellow-500/20 text-yellow-500"
              }`}>
                {selecionada.status?.toUpperCase() || "PENDENTE"}
              </span>
            </div>

            {/* Ações */}
            <div className="pt-4 mt-2 flex flex-col gap-2.5 border-t border-gray-800">
              <button
                onClick={() => atualizarStatus(selecionada.id, "presente")}
                className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                <UserCheck className="w-5 h-5" /> Marcar Presença
              </button>

              <button
                onClick={() => atualizarStatus(selecionada.id, "confirmado")}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" /> Confirmar</span>
              </button>

              <button
                onClick={() => {
                  setRescheduleData({ data: selecionada.data, hora: selecionada.hora });
                  setShowRescheduleModal(true);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><CalendarClock className="w-4 h-4" /> Reagendar</span>
              </button>

              <button
                onClick={() => atualizarStatus(selecionada.id, "cancelado")}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-500 font-semibold py-2.5 rounded-xl transition-colors"
              >
                <span className="flex items-center justify-center gap-2"><XCircle className="w-4 h-4" /> Cancelar</span>
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
              className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors text-sm"
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
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors text-sm"
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
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors text-sm"
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
              className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white focus:border-emerald-500 outline-none transition-colors text-sm"
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
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-gray-800 text-slate-400 cursor-not-allowed text-sm"
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
                className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white focus:border-emerald-500 outline-none transition-colors text-sm"
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
              className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors text-sm min-h-[80px] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Plus className="w-4 h-4" /> Criar Agendamento</>}
          </button>
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
            <div className="bg-slate-900/50 p-4 rounded-xl border border-gray-800">
              <p className="text-sm text-slate-400 mb-1">Paciente</p>
              <p className="text-white font-bold">{selecionada.nome}</p>
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
                  className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white focus:border-amber-500 outline-none transition-colors text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-400 mb-1.5 block">Novo Horário</label>
                <select
                  required
                  value={rescheduleData.hora}
                  onChange={(e) => setRescheduleData({ ...rescheduleData, hora: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#020617] border border-gray-800 text-white focus:border-amber-500 outline-none transition-colors text-sm"
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
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-600/20 disabled:opacity-50"
            >
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Reagendando...</> : <><CalendarClock className="w-4 h-4" /> Confirmar Reagendamento</>}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
