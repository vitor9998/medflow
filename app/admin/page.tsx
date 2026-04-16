"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { 
  Users, 
  CalendarDays, 
  CheckCircle2, 
  XCircle 
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
  Bar
} from "recharts";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

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

      // Buscar profile para checar role
      const { data: prof } = await supabase
        .from("profiles")
        .select("role, medicos_ids")
        .eq("id", user.id)
        .single();

      setUserRole(prof?.role || "doctor");

      if (prof?.role === "secretaria" && prof.medicos_ids?.length > 0) {
        // Secretária: buscar agendamentos de todos os médicos vinculados
        fetchConsultasMulti(prof.medicos_ids);
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

  // --- Processamento de Métricas ---
  const hoje = new Date().toISOString().split('T')[0];
  
  const consultasHoje = consultas.filter(c => c.data === hoje).length;
  const totalConsultas = consultas.length;
  const canceladas = consultas.filter(c => c.status === "cancelado").length;
  const pendentes = consultas.filter(c => c.status === "pendente" || c.status === "aguardando").length;
  const confirmadas = consultas.filter(c => c.status === "confirmado").length;
  
  const taxaFalta = totalConsultas > 0 ? ((canceladas / totalConsultas) * 100).toFixed(1) : "0.0";

  // Agrupar para gráfico (Consultas por Dia)
  const dadosPorDiaMap = consultas.reduce((acc, c) => {
    // Para simplificar, mostra os últimos 7 dias ou agrupa pela data DD/MM
    const datePart = c.data.split("-").slice(1).join("/"); // Formato MM/DD
    acc[datePart] = (acc[datePart] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGrafico = Object.keys(dadosPorDiaMap).sort().map(k => ({
    name: k,
    consultas: dadosPorDiaMap[k]
  })).slice(-14); // Últimos 14 dias com agendamentos

  // Gráfico de status
  const dadosStatus = [
    { name: "Confirmado", value: confirmadas, fill: "#22c55e" },
    { name: "Cancelado", value: canceladas, fill: "#ef4444" },
    { name: "Pendente", value: pendentes, fill: "#facc15" }
  ];

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 w-full max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            {userRole === "secretaria" 
              ? "Visão consolidada de todos os médicos gerenciados." 
              : "Resumo das atividades do seu consultório."
            }
          </p>
        </div>
        {userRole === "secretaria" && (
          <span className="text-xs font-bold uppercase bg-emerald-500/15 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
            Secretária
          </span>
        )}
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4 text-slate-400 mb-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <CalendarDays className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Consultas Hoje</h3>
          </div>
          <div className="text-4xl font-bold text-white">{consultasHoje}</div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-4 text-slate-400 mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Total de Consultas</h3>
          </div>
          <div className="text-4xl font-bold text-white">{totalConsultas}</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 text-slate-400 mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-sm">Taxa de Cancelamento</h3>
          </div>
          <div className="text-4xl font-bold text-white">{taxaFalta}%</div>
        </Card>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LINE CHART */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-6">Consultas ao Longo do Tempo</h2>
          <div className="h-[300px] w-full text-sm">
            {dadosGrafico.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosGrafico} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consultas" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Sem dados suficientes para exibir o gráfico.
              </div>
            )}
          </div>
        </Card>

        {/* BAR CHART: STATUS */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Distribuição de Status</h2>
          <div className="h-[300px] w-full text-sm flex flex-col gap-4">
             {totalConsultas > 0 ? (
               <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosStatus} margin={{ left: -30 }}>
                    <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: '#1e293b', opacity: 0.4}}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
             ) : (
                <div className="h-full flex items-center justify-center text-slate-500">
                  Sem dados para exibir.
                </div>
             )}
          </div>
        </Card>
      </div>

    </div>
  );
}