"use client";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Bell,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [consultas, setConsultas] = useState<any[]>([]);
  const [nome, setNome] = useState("");

  useEffect(() => {
    init();
  }, []);

  async function init() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      // 🔹 buscar perfil
      const { data: profile } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();

      setNome(profile?.nome || "");

      // 🔹 buscar consultas do médico
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id);

      setConsultas(data || []);
    }
  }

  // 📊 MÉTRICAS
  const hoje = new Date().toISOString().split("T")[0];

  const consultasHoje = consultas.filter(
    (c: any) => c.data === hoje
  ).length;

  const totalConsultas = consultas.length;

  const faltas = consultas.filter(
    (c: any) => c.status === "cancelado"
  ).length;

  const taxaFalta = totalConsultas
    ? ((faltas / totalConsultas) * 100).toFixed(1)
    : 0;

  return (
    <div className="flex bg-[#020617] text-slate-200 min-h-screen">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/60 flex flex-col p-4 hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Activity className="text-black w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white">
            MedFlow
          </span>
        </div>

        <nav className="flex flex-col gap-2">

          <div className="flex items-center gap-3 px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </div>

          <Link
            href="/admin/agenda"
            className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <CalendarDays className="w-5 h-5" />
            Agenda
          </Link>

          <div className="flex items-center gap-3 px-3 py-2 text-slate-400">
            <Users className="w-5 h-5" />
            Pacientes
          </div>

          <div className="flex items-center gap-3 px-3 py-2 text-slate-400">
            <Settings className="w-5 h-5" />
            Configurações
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between mb-8">
          <h2 className="text-lg text-slate-400">
            Dashboard
          </h2>

          <div className="flex items-center gap-4">
            <Bell />
            <span className="text-sm">
              {nome || user?.email}
            </span>
          </div>
        </div>

        {/* TITULO */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Olá, Dr. {nome || user?.email?.split("@")[0]}
          </h1>

          <p className="text-slate-400">
            Aqui está o resumo do seu consultório hoje
          </p>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-4 gap-6 mb-10">

          <Card
            title="Consultas Hoje"
            value={consultasHoje}
            icon={<CheckCircle2 />}
          />

          <Card
            title="Total Consultas"
            value={totalConsultas}
            icon={<CalendarDays />}
          />

          <Card
            title="Pacientes"
            value={totalConsultas}
            icon={<Users />}
          />

          <Card
            title="Taxa de faltas"
            value={`${taxaFalta}%`}
            icon={<XCircle />}
          />

        </div>

        {/* LISTA RECENTE */}
        <div className="bg-slate-900 p-6 rounded-xl">
          <h2 className="mb-4 text-lg font-semibold">
            Últimas consultas
          </h2>

          {consultas.slice(0, 5).map((c: any) => (
            <div
              key={c.id}
              className="flex justify-between border-b border-slate-800 py-3"
            >
              <span>{c.nome}</span>
              <span>{c.data}</span>
              <span>{c.status}</span>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

// 📦 COMPONENTE CARD
function Card({ title, value, icon }: any) {
  return (
    <div className="bg-slate-900 p-6 rounded-xl">
      <div className="flex justify-between mb-2">
        <span className="text-slate-400 text-sm">
          {title}
        </span>
        {icon}
      </div>

      <span className="text-3xl font-bold">
        {value}
      </span>
    </div>
  );
}