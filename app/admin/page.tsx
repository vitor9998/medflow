"use client";

import { useEffect, useState } from "react";
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
} from "recharts";

// --- Status config ---
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pendente:   { label: "Pendente",   bg: "bg-amber-500/10",   text: "text-amber-400",   dot: "bg-amber-400" },
  confirmado: { label: "Confirmado", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  cancelado:  { label: "Cancelado",  bg: "bg-red-500/10",     text: "text-red-400",     dot: "bg-red-400" },
  presente:   { label: "Presente",   bg: "bg-sky-500/10",     text: "text-sky-400",     dot: "bg-sky-400" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pendente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

// --- Skeleton loader ---
function ListSkeleton() {
  return (
    <div className="divide-y divide-slate-800/60">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-5 animate-pulse">
          <div className="w-10 h-10 rounded-xl bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-800 rounded w-36" />
            <div className="h-2.5 bg-slate-800/60 rounded w-24" />
          </div>
          <div className="h-6 bg-slate-800 rounded w-20" />
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

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, medicos_ids, clinica_id")
        .eq("id", user.id)
        .single();

      setUserRole(prof?.role || "doctor");

      if (prof?.role === "secretaria") {
        if (prof.clinica_id) {
          const { data: docs } = await supabase
            .from("profiles")
            .select("id")
            .eq("clinica_id", prof.clinica_id)
            .eq("role", "doctor");

          const ids = (docs || []).map((d: any) => d.id);
          if (ids.length > 0) fetchConsultasMulti(ids);
          else setIsLoading(false);
        } else if (prof.medicos_ids?.length > 0) {
          fetchConsultasMulti(prof.medicos_ids);
        } else {
          setIsLoading(false);
        }
      } else {
        fetchConsultas(user.id);
      }
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
      console.log("Erro ao buscar:", error);
    } else {
      setConsultas(data || []);
    }
    setIsLoading(false);
  }

  async function fetchConsultasMulti(medicoIds: string[]) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .in("user_id", medicoIds)
      .order("data", { ascending: true });

    if (error) {
      console.log("Erro ao buscar:", error);
    } else {
      setConsultas(data || []);
    }
    setIsLoading(false);
  }

  async function atualizarStatus(id: number, novoStatus: string) {
    setUpdatingId(id);
    const { error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (!error) {
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: novoStatus } : item
        )
      );
    }
    setUpdatingId(null);
    setExpandedId(null);
  }

  async function registrarTentativa(id: number, atual: number) {
    setUpdatingId(id);
    const novo = (atual || 0) + 1;
    const { error } = await supabase
      .from("agendamentos")
      .update({ tentativas_contato: novo })
      .eq("id", id);

    if (!error) {
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, tentativas_contato: novo } : item
        )
      );
    }
    setUpdatingId(null);
  }

  // --- Metrics ---
  const hoje = new Date().toISOString().split("T")[0];

  const consultasHoje = consultas.filter((c) => c.data === hoje).length;
  const totalConsultas = consultas.length;
  const canceladas = consultas.filter((c) => c.status === "cancelado").length;
  const pendentes = consultas.filter(
    (c) => c.status === "pendente" || c.status === "aguardando"
  ).length;
  const confirmadas = consultas.filter(
    (c) => c.status === "confirmado"
  ).length;

  const taxaFalta =
    totalConsultas > 0
      ? ((canceladas / totalConsultas) * 100).toFixed(1)
      : "0.0";

  // Chart data
  const dadosPorDiaMap = consultas.reduce((acc, c) => {
    const datePart = c.data.split("-").slice(1).join("/");
    acc[datePart] = (acc[datePart] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGrafico = Object.keys(dadosPorDiaMap)
    .sort()
    .map((k) => ({ name: k, consultas: dadosPorDiaMap[k] }))
    .slice(-14);

  const dadosStatus = [
    { name: "Confirmado", value: confirmadas, fill: "#34d399" },
    { name: "Cancelado", value: canceladas, fill: "#f87171" },
    { name: "Pendente", value: pendentes, fill: "#fbbf24" },
  ];

  // Split appointments
  const consultasAtivas = consultas
    .filter((c) => c.status !== "cancelado")
    .sort((a, b) => {
      if (a.data === b.data) return (a.hora || "").localeCompare(b.hora || "");
      return a.data.localeCompare(b.data);
    });

  // --- Metrics array for clean rendering ---
  const metricas = [
    {
      label: "Hoje",
      value: consultasHoje,
      icon: CalendarDays,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Total",
      value: totalConsultas,
      icon: Clock,
      accent: "text-slate-300",
      iconBg: "bg-slate-500/10",
    },
    {
      label: "Cancelamento",
      value: `${taxaFalta}%`,
      icon: XCircle,
      accent: "text-red-400",
      iconBg: "bg-red-500/10",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {userRole === "secretaria"
              ? "Todos os agendamentos dos seus medicos."
              : "Resumo das atividades do consultorio."}
          </p>
        </div>
        {userRole === "secretaria" && (
          <span className="text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            Secretaria
          </span>
        )}
      </div>

      {/* METRICS — no cards, just clean rows with border-b */}
      <div className="grid grid-cols-3 gap-0 bg-[#0B1120] rounded-2xl border border-slate-800 overflow-hidden">
        {metricas.map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center gap-4 p-5 ${
              i < metricas.length - 1 ? "border-r border-slate-800" : ""
            }`}
          >
            <div className={`p-2.5 rounded-xl ${m.iconBg}`}>
              <m.icon className={`w-5 h-5 ${m.accent}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {m.label}
              </p>
              <p className={`text-2xl font-bold ${m.accent} font-mono tabular-nums`}>
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT — List + Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* APPOINTMENT LIST — 3 cols */}
        <div className="lg:col-span-3 bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Agendamentos
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {consultasAtivas.length} ativos
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[540px]">
            {isLoading ? (
              <ListSkeleton />
            ) : consultasAtivas.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                  <CalendarDays className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm font-bold text-slate-400 mb-1">Nenhum agendamento</p>
                <p className="text-xs text-slate-600 max-w-[240px] leading-relaxed">
                  Quando pacientes agendarem consultas, elas aparecerao aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/40">
                {consultasAtivas.map((c) => {
                  const isExpanded = expandedId === c.id;
                  const isUpdating = updatingId === c.id;

                  return (
                    <div key={c.id} className="group">
                      {/* Main row */}
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : c.id)
                        }
                        className="w-full flex items-center gap-3.5 py-3.5 px-5 text-left hover:bg-slate-800/30 transition-colors active:scale-[0.995]"
                      >
                        {/* Time block */}
                        <div className="w-11 h-11 rounded-xl bg-slate-800/60 flex flex-col items-center justify-center shrink-0 border border-slate-700/40">
                          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                            {c.data?.split("-")[2]}/{c.data?.split("-")[1]}
                          </span>
                          <span className="text-xs font-bold text-white leading-tight font-mono">
                            {c.hora?.substring(0, 5)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {c.nome}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {c.telefone && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {c.telefone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Attempts + Badge + chevron */}
                        {(c.tentativas_contato || 0) > 0 && (
                          <span className="text-[10px] font-mono text-slate-500 tabular-nums border border-slate-800 rounded px-1.5 py-0.5">
                            {c.tentativas_contato}x
                          </span>
                        )}
                        <StatusBadge status={c.status || "pendente"} />
                        <ChevronRight
                          className={`w-4 h-4 text-slate-600 transition-transform ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      {/* Expanded actions */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2 bg-slate-900/30 border-t border-slate-800/30">
                          {c.status !== "confirmado" && (
                            <button
                              onClick={() =>
                                atualizarStatus(c.id, "confirmado")
                              }
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirmar
                            </button>
                          )}
                          {c.status !== "presente" && (
                            <button
                              onClick={() =>
                                atualizarStatus(c.id, "presente")
                              }
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 hover:bg-sky-500/20 transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Presente
                            </button>
                          )}
                          {c.status !== "cancelado" && (
                            <button
                              onClick={() =>
                                atualizarStatus(c.id, "cancelado")
                              }
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Cancelar
                            </button>
                          )}
                          <button
                            onClick={() =>
                              registrarTentativa(c.id, c.tentativas_contato || 0)
                            }
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-700 hover:bg-slate-500/15 transition-all active:scale-[0.97] disabled:opacity-50 ml-auto"
                          >
                            <PhoneOutgoing className="w-3.5 h-3.5" />
                            Tentativa ({c.tentativas_contato || 0})
                          </button>
                          {c.sintomas && (
                            <div className="w-full mt-2 flex items-start gap-2 px-1">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500/70 mt-0.5 shrink-0" />
                              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                                {c.sintomas}
                              </p>
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
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-white mb-4 tracking-tight">
              Volume por dia
            </h2>
            <div className="h-[200px] w-full text-xs">
              {dadosGrafico.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dadosGrafico}
                    margin={{ top: 5, right: 10, bottom: 5, left: -25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#1e293b"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#475569", fontSize: 10 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#475569", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consultas"
                      stroke="#34d399"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Sem dados suficientes.
                </div>
              )}
            </div>
          </div>

          {/* BAR CHART */}
          <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-white mb-4 tracking-tight">
              Por status
            </h2>
            <div className="h-[200px] w-full text-xs">
              {totalConsultas > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosStatus} margin={{ left: -25 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#475569", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#1e293b", opacity: 0.4 }}
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#1e293b",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs">
                  Sem dados para exibir.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
