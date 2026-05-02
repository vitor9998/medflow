"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  ChevronRight,
  Phone,
  PhoneOutgoing,
  AlertCircle,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LabelList,
} from "recharts";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

// --- Status config ---
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pendente:   { label: "Pendente",   bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400" },
  confirmado: { label: "Confirmado", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" },
  cancelado:  { label: "Cancelado",  bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-400" },
  presente:   { label: "Presente",   bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-400" },
  falta:      { label: "Falta",      bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500" },
  bloqueado:  { label: "Bloqueado",  bg: "bg-stone-100",  text: "text-stone-500",   dot: "bg-stone-300" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pendente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

// --- Skeleton loader ---
function ListSkeleton() {
  return (
    <div className="divide-y divide-stone-100/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-5">
          <div className="w-11 h-11 rounded-xl bg-stone-100 shrink-0 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-stone-100 rounded w-40 animate-pulse" />
            <div className="h-2.5 bg-stone-50 rounded w-24 animate-pulse" />
          </div>
          <div className="h-6 bg-stone-100 rounded-md w-20 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const initialized = useRef(false);
 
   useEffect(() => {
     async function init() {
       if (initialized.current) return;
       initialized.current = true;
 
       const {
         data: { user },
       } = await supabase.auth.getUser();
 
       if (!user) {
         router.push("/login");
         return;
       }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, clinica_id")
        .eq("id", user.id)
        .single();

      setUserRole(prof?.role || "doctor");
      fetchConsultas(user.id, prof?.role, prof?.clinica_id);
    }

    init();
  }, []);

  async function fetchConsultas(userId: string, role?: string, clinicaId?: string) {
    let query = supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true });

    if (role === "secretaria" && clinicaId) {
      query = query.eq("clinica_id", clinicaId);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Erro ao buscar:", error);
    } else {
      setConsultas(data || []);
    }
    setIsLoading(false);
  }

  async function atualizarStatus(id: number, action: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/agenda/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });

      if (res.ok) {
        const { data } = await res.json();
        setConsultas((prev: any[]) =>
          prev.map((item: any) =>
            item.id === id ? { ...item, status: data.status } : item
          )
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    } finally {
      setUpdatingId(null);
      setExpandedId(null);
    }
  }

  async function registrarTentativa(id: number, atual: number) {
    setUpdatingId(id);
    const novo = (atual || 0) + 1;
    const { error } = await supabase
      .from("agendamentos")
      .update({ tentativas_contato: novo })
      .eq("id", id);

    if (!error) {
      setConsultas((prev: any[]) =>
        prev.map((item: any) =>
          item.id === id ? { ...item, tentativas_contato: novo } : item
        )
      );
    }
    setUpdatingId(null);
  }

  // --- Derived logic for "falta" (no-show) ---
  const agora = new Date();
  const mappedConsultas = consultas.map((c: any) => {
    if (c.status === 'presente' || c.status === 'cancelado') return c;
    
    const [year, month, day] = c.data.split('-').map(Number);
    const [hour, minute] = (c.hora || '00:00').split(':').map(Number);
    const dataConsulta = new Date(year, month - 1, day, hour, minute);
    
    // Margem de 15 minutos antes de marcar como falta
    dataConsulta.setMinutes(dataConsulta.getMinutes() + 15);

    if (dataConsulta < agora) {
       return { ...c, status: 'falta' };
    }
    return c;
  });

  // --- Metrics using mapped data ---
  const hoje = new Date().toLocaleDateString('en-CA'); // Garante formato YYYY-MM-DD local

  const consultasHoje = mappedConsultas.filter((c: any) => c.data === hoje).length;
  const totalConsultas = mappedConsultas.length;
  const canceladas = mappedConsultas.filter((c: any) => c.status === "cancelado").length;
  const faltas = mappedConsultas.filter((c: any) => c.status === "falta").length;
  const pendentes = mappedConsultas.filter(
    (c: any) => c.status === "pendente"
  ).length;
  const confirmadas = mappedConsultas.filter(
    (c: any) => c.status === "confirmado"
  ).length;

  const taxaFalta =
    totalConsultas > 0
      ? (((canceladas + faltas) / totalConsultas) * 100).toFixed(1)
      : "0.0";

  // --- HOJE DETAIL METRICS ---
  const consultasHojeLista = mappedConsultas.filter((c: any) => c.data === hoje);
  const totalHoje = consultasHojeLista.length;
  const presentesHoje = consultasHojeLista.filter((c: any) => c.status === 'presente').length;
  const faltasHoje = consultasHojeLista.filter((c: any) => c.status === 'falta' || (c.data === hoje && c.status === 'cancelado')).length;
  const confirmadasHoje = consultasHojeLista.filter((c: any) => c.status === 'confirmado').length;
  const altoRiscoHoje = consultasHojeLista.filter((c: any) => c.status === 'pendente' && (c.confirmacao_status === 'sem_resposta' || (c.tentativas_contato || 0) >= 2)).length;

  const taxaPresencaHoje = totalHoje > 0 ? Math.round((presentesHoje / totalHoje) * 100) : 0;
  const taxaFaltaHoje = totalHoje > 0 ? Math.round((faltasHoje / totalHoje) * 100) : 0;

  // Greeting by time of day
  const horaAtual = new Date().getHours();
  const saudacao = horaAtual < 12 ? "Bom dia" : horaAtual < 18 ? "Boa tarde" : "Boa noite";
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long"
  });
  const dataHojeFormatada = dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1);

  // Chart data
  const dadosPorDiaMap = mappedConsultas.reduce((acc: any, c: any) => {
    const datePart = c.data.split("-").slice(1).join("/");
    acc[datePart] = (acc[datePart] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGrafico = Object.keys(dadosPorDiaMap)
    .sort()
    .map((k: any) => ({ name: k, consultas: dadosPorDiaMap[k] }))
    .slice(-14);

  const dadosStatus = [
    { name: "Confirmado", value: confirmadasHoje, fill: "#065f46" }, // emerald-800
    { name: "Falta", value: faltasHoje, fill: "#be123c" }, // rose-700
    { name: "Pendente", value: totalHoje - presentesHoje - faltasHoje, fill: "#b45309" }, // amber-700
  ];

  // Split appointments and sort by priority
  const consultasAtivas = mappedConsultas
    .filter((c: any) => c.status !== "cancelado" && c.data >= hoje)
    .sort((a, b) => {
      // Helper para prioridade
      const getPriority = (c: any) => {
        const isAltoRisco = c.status === 'pendente' && (c.confirmacao_status === 'sem_resposta' || (c.tentativas_contato || 0) >= 2);
        if (isAltoRisco) return 1;
        if (c.status === 'pendente') return 2;
        if (c.status === 'confirmado') return 3;
        if (c.status === 'presente') return 4;
        return 5;
      };

      const prioA = getPriority(a);
      const prioB = getPriority(b);

      if (prioA !== prioB) return prioA - prioB;
      
      // Se mesma prioridade, ordena por data e hora
      if (a.data === b.data) return (a.hora || "").localeCompare(b.hora || "");
      return a.data.localeCompare(b.data);
    });

  // --- Metrics array for clean rendering ---
  const metricas = [
    {
      label: "Consultas hoje",
      value: consultasHoje,
      icon: CalendarDays,
      accent: "text-emerald-900",
      iconBg: "bg-emerald-900/5",
    },
    {
      label: "Total geral",
      value: totalConsultas,
      icon: Clock,
      accent: "text-stone-700",
      iconBg: "bg-stone-100",
    },
    {
      label: "Confirmados",
      value: confirmadas,
      icon: CheckCircle2,
      accent: "text-emerald-700",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Cancelamentos",
      value: `${taxaFalta}%`,
      icon: XCircle,
      accent: "text-rose-700",
      iconBg: "bg-rose-50",
    },
  ];

  // Decision support messages
  const mensagensDecisao = [];
  if (altoRiscoHoje > 0) {
    mensagensDecisao.push({
      text: `${altoRiscoHoje} ${altoRiscoHoje === 1 ? 'risco de falta' : 'riscos de falta'}`,
      icon: AlertCircle,
      color: 'text-amber-700'
    });
  }
  if (faltasHoje > 0) {
    mensagensDecisao.push({
      text: `${faltasHoje} ${faltasHoje === 1 ? 'não compareceu' : 'não compareceram'}`,
      icon: XCircle,
      color: 'text-rose-700'
    });
  }
  if (taxaPresencaHoje >= 80 && totalHoje >= 3) {
     mensagensDecisao.push({
      text: "Alta presença",
      icon: CheckCircle2,
      color: 'text-emerald-700'
    });
  } else if (taxaPresencaHoje < 50 && totalHoje >= 3) {
     mensagensDecisao.push({
      text: "Muitas faltas",
      icon: AlertCircle,
      color: 'text-rose-700'
    });
  }

  // Fallback para quando não houver nada crítico ou estiver vazio
  if (mensagensDecisao.length === 0) {
    mensagensDecisao.push({
      text: totalHoje === 0 ? "Agenda livre" : "Operação estável",
      icon: Sparkles,
      color: 'text-stone-400'
    });
  }
  
  const resumoExibido = mensagensDecisao.slice(0, 2);

  return (
    <div className="p-6 md:p-10 space-y-10 w-full max-w-[1400px] mx-auto">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">{dataHojeFormatada}</p>
          <h1 className={`${playfair.className} text-4xl font-semibold text-stone-900 tracking-tight leading-none`}>
            {saudacao}
          </h1>
          <p className="text-stone-500 font-light mt-2 text-sm tracking-wide">
            {userRole === "secretaria"
              ? "Visão consolidada de todos os médicos."
              : "Resumo das atividades do consultório."}
          </p>
        </div>
        {userRole === "secretaria" && (
          <span className="text-[10px] font-bold uppercase bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg border border-stone-200/60 tracking-widest shrink-0 mt-1">
            Secretaria
          </span>
        )}
      </div>

      {/* ALERTAS OPERACIONAIS */}
      {altoRiscoHoje > 0 && (
        <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100/50 p-2.5 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <p className={`${playfair.className} text-lg font-semibold text-amber-900 leading-none`}>
                Atenção: {altoRiscoHoje} {altoRiscoHoje === 1 ? 'paciente com alto risco' : 'pacientes com alto risco'} hoje
              </p>
              <p className="text-xs text-amber-700/80 mt-1.5 font-medium tracking-wide">Aguardando confirmação ou sem resposta às tentativas de contato.</p>
            </div>
          </div>
          <button 
            onClick={() => router.push('/admin/agenda')}
            className="text-[10px] font-bold uppercase tracking-widest bg-white text-amber-700 px-4 py-2.5 rounded-xl border border-amber-200/50 hover:bg-amber-50 transition-all shadow-sm active:scale-95 whitespace-nowrap"
          >
            Ver na agenda
          </button>
        </div>
      )}

      {/* SEÇÃO 1: MONITORAMENTO DE HOJE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-700 rounded-full animate-pulse" />
            <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Painel Operacional (Hoje)</h2>
          </div>

          {/* RESUMO EXECUTIVO (Sinalização Rápida) */}
          {resumoExibido.length > 0 && (
            <div className="flex items-center gap-3">
              {resumoExibido.map((msg, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200/60 shadow-sm animate-in fade-in zoom-in duration-700">
                  <msg.icon className={`w-3 h-3 ${msg.color}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-stone-600">{msg.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-3xl p-8 md:p-12 border border-stone-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-900/10 transition-all duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Agenda de hoje</p>
              <div className="flex items-baseline gap-5">
                 <span className={`${playfair.className} text-7xl font-semibold tabular-nums text-emerald-900 tracking-tighter`}>{totalHoje}</span>
                 <div className="flex flex-col">
                   <span className={`${playfair.className} text-stone-900 font-semibold text-2xl leading-tight`}>Agendamentos</span>
                   <span className="text-stone-400 font-medium text-xs uppercase tracking-widest mt-1">Total previstos</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 lg:gap-16 pt-8 lg:pt-0 border-t lg:border-t-0 lg:border-l border-stone-100 lg:pl-16">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Presentes</p>
                </div>
                <p className={`${playfair.className} text-3xl font-semibold tabular-nums text-stone-900`}>{presentesHoje}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{taxaPresencaHoje}% presença</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-700" />
                  <p className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">Faltas</p>
                </div>
                <p className={`${playfair.className} text-3xl font-semibold tabular-nums text-stone-900`}>{faltasHoje}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{taxaFaltaHoje}% falta</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-700" />
                  <p className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">Confirmadas</p>
                </div>
                <p className={`${playfair.className} text-3xl font-semibold tabular-nums text-stone-900`}>{confirmadasHoje}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Em espera</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-700 animate-pulse" />
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Alto Risco</p>
                </div>
                <p className={`${playfair.className} text-3xl font-semibold tabular-nums text-stone-900`}>{altoRiscoHoje}</p>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Críticos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 2: RESUMO GERAL */}
      <div className="pt-6 space-y-5">
        <div className="flex items-center gap-2">
           <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Desempenho Geral</h2>
        </div>

      {/* METRICS — borderless row, divide-x */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden">
        {metricas.map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center gap-4 p-6 ${
              i < metricas.length - 1 ? "border-r border-stone-100" : ""
            } ${i >= 2 ? "border-t border-stone-100 md:border-t-0" : ""}`}
          >
            <div className={`p-3 rounded-xl shrink-0 ${m.iconBg}`}>
              <m.icon className={`w-5 h-5 ${m.accent}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mb-2">
                {m.label}
              </p>
              <p className={`text-xl font-semibold tabular-nums leading-none ${m.accent}`}>
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT — List + Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">
        {/* APPOINTMENT LIST — 3 cols */}
        <div className="lg:col-span-3 bg-white border border-stone-200/60 rounded-3xl overflow-hidden flex flex-col shadow-sm">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100/80 bg-stone-50/30">
            <h2 className={`${playfair.className} text-xl font-semibold text-stone-900 tracking-tight`}>
              Agendamentos Ativos
            </h2>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold bg-white px-3 py-1 rounded-full border border-stone-200">
              {consultasAtivas.length} registros
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <ListSkeleton />
            ) : consultasAtivas.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-50 flex items-center justify-center mb-4 border border-stone-100">
                  <CalendarDays className="w-6 h-6 text-stone-300" />
                </div>
                <p className={`${playfair.className} text-xl font-semibold text-stone-500 mb-2`}>Nenhum agendamento</p>
                <p className="text-sm text-stone-400 max-w-[260px] leading-relaxed font-light">
                  A agenda está livre. Novas consultas aparecerão aqui automaticamente.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100/60">
                {consultasAtivas.map((c: any) => {
                  const isExpanded = expandedId === c.id;
                  const isUpdating = updatingId === c.id;

                  return (
                    <div key={c.id} className="group">
                      {/* Main row */}
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : c.id)
                        }
                        className="w-full flex items-center gap-4 py-4 px-6 text-left hover:bg-stone-50 transition-colors active:scale-[0.995]"
                      >
                        {/* Time block */}
                        <div className="w-12 h-12 rounded-xl bg-white flex flex-col items-center justify-center shrink-0 border border-stone-200/60 shadow-sm">
                          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider leading-none mb-0.5">
                            {c.data?.split("-")[2]}/{c.data?.split("-")[1]}
                          </span>
                          <span className="text-xs font-bold text-emerald-900 leading-tight">
                            {c.hora?.substring(0, 5)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] font-semibold text-stone-900 truncate">
                            {c.nome}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {c.telefone && (
                              <span className="text-[11px] font-medium tracking-wide text-stone-500 flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-stone-400" />
                                {c.telefone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attempts + Badge + chevron */}
                        {(c.tentativas_contato || 0) > 0 && (
                          <span className="text-[10px] font-bold text-stone-400 border border-stone-200 rounded px-2 py-0.5 uppercase tracking-widest">
                            {c.tentativas_contato}x
                          </span>
                        )}
                        <StatusBadge status={c.status || "pendente"} />
                        <ChevronRight
                          className={`w-4 h-4 text-stone-400 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded actions */}
                      {isExpanded && (
                        <div className="px-6 pb-5 pt-2 bg-stone-50/50 border-t border-stone-100/60">
                          {(() => {
                            const agora = new Date();
                            const dataConsulta = new Date(`${c.data}T${c.hora}`);
                            const isPassado = dataConsulta < agora;

                            if (isPassado) {
                              return (
                                <div className="py-2 flex items-center gap-2 text-stone-400 italic">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span className="text-xs tracking-wide">Agendamento finalizado. Ações desabilitadas.</span>
                                </div>
                              );
                            }

                            return (
                              <div className="flex flex-wrap gap-2.5 pt-2">
                                {c.status !== "confirmado" && (
                                  <button
                                    onClick={() => atualizarStatus(c.id, "confirmar")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Confirmar
                                  </button>
                                )}
                                {c.status !== "presente" && (
                                  <button
                                    onClick={() => atualizarStatus(c.id, "presente")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-white text-sky-700 border border-sky-200 hover:bg-sky-50 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    Presente
                                  </button>
                                )}
                                {c.status !== "cancelado" && (
                                  <button
                                    onClick={() => atualizarStatus(c.id, "cancelar")}
                                    disabled={isUpdating}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-white text-rose-700 border border-rose-200 hover:bg-rose-50 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    Cancelar
                                  </button>
                                )}
                                <button
                                  onClick={() => registrarTentativa(c.id, c.tentativas_contato || 0)}
                                  disabled={isUpdating}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] tracking-widest uppercase font-bold bg-white text-stone-500 border border-stone-200 hover:bg-stone-50 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm ml-auto"
                                >
                                  <PhoneOutgoing className="w-3.5 h-3.5" />
                                  Tentativa ({c.tentativas_contato || 0})
                                </button>
                              </div>
                            );
                          })()}
                          {c.sintomas && (
                            <div className="w-full mt-4 flex items-start gap-2.5 px-1 bg-white p-3 rounded-xl border border-stone-100">
                              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Motivo / Sintomas</p>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {c.sintomas}
                                </p>
                              </div>
                            </div>
                          )}
                          {c.observacoes_paciente && (
                            <div className="w-full mt-2 flex items-start gap-2.5 px-1 bg-white p-3 rounded-xl border border-stone-100">
                              <Stethoscope className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                              <div>
                                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Observações</p>
                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {c.observacoes_paciente}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CHARTS — 2 cols */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* LINE CHART */}
          <div className="bg-white border border-stone-200/60 rounded-3xl p-6 flex flex-col shadow-sm">
            <h2 className={`${playfair.className} text-xl font-semibold text-stone-900 mb-6 tracking-tight`}>
              Volume por dia
            </h2>
            <div className="h-[220px] w-full text-xs">
              {dadosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dadosGrafico}
                    margin={{ top: 5, right: 10, bottom: 5, left: -25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f5f5f4"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a8a29e", fontSize: 10, fontFamily: "Inter" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#a8a29e", fontSize: 10, fontFamily: "Inter" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e7e5e4",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontFamily: "Inter"
                      }}
                      itemStyle={{ color: "#1c1917", fontWeight: 600 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consultas"
                      stroke="#064e3b" // emerald-900
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#064e3b", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400 text-xs font-light tracking-wide">
                  Sem dados suficientes.
                </div>
              )}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-white border border-stone-200/60 rounded-3xl p-6 flex flex-col shadow-sm">
            <h2 className={`${playfair.className} text-xl font-semibold text-stone-900 mb-6 tracking-tight`}>
              Status Diário
            </h2>
            <div className="h-[220px] w-full text-xs">
              {totalConsultas > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosStatus} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#78716c", fontSize: 10, fontWeight: 600, fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fill: "#a8a29e", fontSize: 10, fontFamily: "Inter" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#fafaf9" }}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e7e5e4",
                        borderRadius: "12px",
                        fontSize: "11px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                        padding: "8px 12px",
                        fontFamily: "Inter"
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={46}>
                      {dadosStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                      <LabelList 
                        dataKey="value" 
                        position="top" 
                        fill="#78716c" 
                        fontSize={11} 
                        fontWeight={700}
                        offset={10}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-stone-400 text-xs font-light tracking-wide">
                  Sem dados para exibir.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
