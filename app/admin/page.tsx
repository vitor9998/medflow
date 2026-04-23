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
  Stethoscope,
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
  pendente:   { label: "Pendente",   bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400" },
  confirmado: { label: "Confirmado", bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  cancelado:  { label: "Cancelado",  bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-400" },
  presente:   { label: "Presente",   bg: "bg-sky-50",     text: "text-sky-600",     dot: "bg-sky-400" },
  bloqueado:  { label: "Bloqueado",  bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-300" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pendente;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

// --- Skeleton loader ---
function ListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-4 px-5">
          <div className="w-11 h-11 rounded-xl skeleton shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 skeleton rounded w-40" />
            <div className="h-2.5 skeleton rounded w-24" />
          </div>
          <div className="h-6 skeleton rounded-md w-20" />
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

  // Greeting by time of day
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long"
  });
  const dataHojeFormatada = dataHoje.charAt(0).toUpperCase() + dataHoje.slice(1);

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
      accent: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      label: "Total",
      value: totalConsultas,
      icon: Clock,
      accent: "text-slate-600",
      iconBg: "bg-slate-100",
    },
    {
      label: "Confirmados",
      value: confirmadas,
      icon: CheckCircle2,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      label: "Cancelamentos",
      value: `${taxaFalta}%`,
      icon: XCircle,
      accent: "text-red-500",
      iconBg: "bg-red-50",
    },
  ];

  return (
    <div className="p-6 md:p-10 space-y-7 w-full max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{dataHojeFormatada}</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {saudacao}
          </h1>
          <p className="text-slate-500 mt-1.5 text-sm">
            {userRole === "secretaria"
              ? "Visao consolidada de todos os medicos."
              : "Resumo das atividades do consultorio."}
          </p>
        </div>
        {userRole === "secretaria" && (
          <span className="text-[11px] font-bold uppercase bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 tracking-wide shrink-0 mt-1">
            Secretaria
          </span>
        )}
      </div>

      {/* METRICS — borderless row, divide-x */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white rounded-2xl border border-slate-200/70 shadow-[0_2px_8px_-2px_rgba(15,23,42,0.06)] overflow-hidden">
        {metricas.map((m, i) => (
          <div
            key={m.label}
            className={`flex items-center gap-3.5 p-5 ${
              i < metricas.length - 1 ? "border-r border-slate-100" : ""
            } ${i >= 2 ? "border-t border-slate-100 md:border-t-0" : ""}`}
          >
            <div className={`p-2.5 rounded-xl shrink-0 ${m.iconBg}`}>
              <m.icon className={`w-[17px] h-[17px] ${m.accent}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1.5">
                {m.label}
              </p>
              <p className={`text-xl font-bold tabular-nums leading-none font-mono ${m.accent}`}>
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT — List + Charts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* APPOINTMENT LIST — 3 cols */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
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
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <CalendarDays className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-500 mb-1">Nenhum agendamento</p>
                <p className="text-xs text-slate-600 max-w-[240px] leading-relaxed">
                  Quando pacientes agendarem consultas, elas aparecerao aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
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
                        className="w-full flex items-center gap-3.5 py-3.5 px-5 text-left hover:bg-slate-50 transition-colors active:scale-[0.995]"
                      >
                        {/* Time block */}
                        <div className="w-11 h-11 rounded-xl bg-slate-50 flex flex-col items-center justify-center shrink-0 border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase leading-none">
                            {c.data?.split("-")[2]}/{c.data?.split("-")[1]}
                          </span>
                          <span className="text-xs font-bold text-slate-700 leading-tight font-mono">
                            {c.hora?.substring(0, 5)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
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
                          <span className="text-[10px] font-mono text-slate-400 tabular-nums border border-slate-200 rounded px-1.5 py-0.5">
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
                        <div className="px-5 pb-4 pt-1 flex flex-wrap gap-2 bg-slate-50/50 border-t border-slate-100">
                          {c.status !== "confirmado" && (
                            <button
                              onClick={() =>
                                atualizarStatus(c.id, "confirmado")
                              }
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-[0.97] disabled:opacity-50"
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 transition-all active:scale-[0.97] disabled:opacity-50"
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
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all active:scale-[0.97] disabled:opacity-50"
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
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-all active:scale-[0.97] disabled:opacity-50 ml-auto"
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
                          {c.observacoes_paciente && (
                            <div className="w-full mt-1 flex items-start gap-2 px-1">
                              <Stethoscope className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <p className="text-[11px] text-slate-400 leading-relaxed">
                                {c.observacoes_paciente}
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">
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
                      stroke="#e2e8f0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "#334155" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="consultas"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
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
          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col">
            <h2 className="text-sm font-bold text-slate-800 mb-4 tracking-tight">
              Por status
            </h2>
            <div className="h-[200px] w-full text-xs">
              {totalConsultas > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosStatus} margin={{ left: -25 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f1f5f9", opacity: 0.6 }}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e2e8f0",
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
