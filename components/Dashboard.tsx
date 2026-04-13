"use client";

import { useRouter } from "next/navigation";

import { 
  LayoutDashboard, CalendarDays, Users, Settings, 
  Search, Bell, MoreHorizontal, ArrowUpRight, ArrowDownRight,
  Activity, CheckCircle2, XCircle
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="flex bg-[#020617] text-slate-200 min-h-screen font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/60 flex flex-col p-4 hidden md:flex">
        
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Activity className="text-slate-950 w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-white">MedFlow</span>
        </div>

        <nav className="flex flex-col gap-2">

          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => router.push("/admin/agenda")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <CalendarDays className="w-5 h-5" />
            Agenda
          </button>

          <button
            onClick={() => router.push("/admin/pacientes")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <Users className="w-5 h-5" />
            Pacientes
          </button>

          <button
            onClick={() => router.push("/admin/config")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <Settings className="w-5 h-5" />
            Configurações
          </button>

        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-3 w-full md:w-96 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              placeholder="Buscar..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          <div className="flex items-center gap-5 ml-4">
            <Bell className="w-5 h-5 text-slate-400" />

            {/* Avatar simples (sem foto fake) */}
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold">
              V
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 px-4 md:px-8 pb-8">

          {/* TOP */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Olá, Doutor
              </h1>
              <p className="text-slate-400 text-sm">
                Resumo do seu consultório
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/agenda")}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              Novo Agendamento
            </button>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

            <Card title="Consultas Hoje" value="12" icon={<CheckCircle2 />} />
            <Card title="Semana" value="48" icon={<CalendarDays />} />
            <Card title="Pacientes" value="142" icon={<Users />} />
            <Card title="Faltas" value="3.2%" icon={<XCircle />} red />

          </div>

          {/* TABELA */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden">
            
            <div className="p-6 border-b border-slate-800 flex justify-between">
              <h2 className="text-white">Consultas</h2>
              <button className="text-emerald-400 text-sm">
                Ver todas
              </button>
            </div>

            <div className="p-6 text-slate-400">
              (Aqui depois vamos conectar com Supabase 🔥)
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

/* COMPONENTE CARD */
function Card({ title, value, icon, red = false }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

      <div className="flex justify-between mb-4">
        <h3 className="text-slate-400 text-sm">{title}</h3>
        <div className={`p-2 rounded ${red ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
          {icon}
        </div>
      </div>

      <div className="text-3xl text-white font-bold">
        {value}
      </div>

    </div>
  );
}
