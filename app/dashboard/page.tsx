import { 
  LayoutDashboard, CalendarDays, Users, Settings, 
  Search, Bell, ArrowUpRight, ArrowDownRight,
  Activity, CheckCircle2, XCircle,
  MessageCircle, Check, X, Clock
} from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex bg-[#020617] text-slate-200 min-h-screen font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/60 flex flex-col p-4 hidden md:flex">
         <div className="flex items-center gap-3 mb-10 px-2 mt-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 shadow-md shadow-emerald-500/20 flex items-center justify-center">
              <Activity className="text-slate-950 w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">MedFlow</span>
         </div>
         <nav className="flex flex-col gap-1.5">
           <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/10 hover:bg-emerald-500/20 transition-colors">
             <LayoutDashboard className="w-5 h-5" />
             Dashboard
           </a>
           <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
             <CalendarDays className="w-5 h-5" />
             Agenda
           </a>
           <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
             <Users className="w-5 h-5" />
             Pacientes
           </a>
           <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 font-medium hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
             <Settings className="w-5 h-5" />
             Configurações
           </a>
         </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-3 w-96 bg-slate-900 border border-slate-800/60 rounded-xl px-3.5 py-2.5 outline outline-2 outline-transparent focus-within:outline-emerald-500/20 focus-within:border-emerald-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar pacientes, consultas..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder:text-slate-500" 
            />
          </div>
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#020617] rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden cursor-pointer hover:border-emerald-500 transition-colors">
               <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 px-8 pb-8 overflow-auto">
           <div className="flex items-center justify-between mb-8 mt-2">
             <div>
               <h1 className="text-3xl font-bold text-white mb-1.5 tracking-tight">Olá, Dr. Silva</h1>
               <p className="text-slate-400 text-sm">Aqui está o resumo do seu consultório hoje.</p>
             </div>
             <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all">
               <CalendarDays className="w-4 h-4" />
               Novo Agendamento
             </button>
           </div>

           {/* METRICS GRID */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-400 text-sm font-medium">Consultas Hoje</h3>
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white tracking-tight">12</span>
                  <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 20%
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-400 text-sm font-medium">Consultas na Semana</h3>
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                     <CalendarDays className="w-5 h-5 text-emerald-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white tracking-tight">48</span>
                  <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 12%
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-400 text-sm font-medium">Pacientes Atendidos</h3>
                   <div className="p-2 bg-emerald-500/10 rounded-xl">
                     <Users className="w-5 h-5 text-emerald-400" />
                   </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white tracking-tight">142</span>
                  <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> 4%
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-slate-400 text-sm font-medium">Taxa de Faltas</h3>
                   <div className="p-2 bg-red-500/10 rounded-xl">
                     <XCircle className="w-5 h-5 text-red-500" />
                   </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-white tracking-tight">3.2%</span>
                  <span className="text-sm font-medium text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" /> 1.1%
                  </span>
                </div>
              </div>
           </div>

           {/* MAIN LAYOUT: APPOINTMENTS AND CALENDAR */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT: CONSULTAS RECENTES */}
             <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
               <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Próximas Consultas</h2>
                  <button className="text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">
                    Ver todas
                  </button>
               </div>
               <div className="overflow-x-auto flex-1">
                 <table className="w-full text-left text-sm text-slate-400">
                   <thead className="bg-slate-900/50 text-slate-500 font-medium border-b border-slate-800/60">
                     <tr>
                       <th className="px-6 py-4 font-medium">Paciente</th>
                       <th className="px-6 py-4 font-medium">Horário</th>
                       <th className="px-6 py-4 font-medium">Status</th>
                       <th className="px-6 py-4 font-medium text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                     
                     <tr className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-slate-700">
                                  MB
                              </div>
                              <div>
                                  <p className="text-white font-medium">Mariana Barros</p>
                                  <p className="text-xs text-slate-500">Primeira Consulta</p>
                              </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-emerald-500" /> Hoje, 15:30
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Aguardando
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button title="Confirmar Consulta" className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20">
                                <Check className="w-4 h-4" />
                            </button>
                            <button title="Cancelar Consulta" className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                                <X className="w-4 h-4" />
                            </button>
                            <button title="Mensagem no WhatsApp" className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-500/20">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                       </td>
                     </tr>

                     <tr className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-slate-700">
                                  AS
                              </div>
                              <div>
                                  <p className="text-white font-medium">Arthur Silva</p>
                                  <p className="text-xs text-slate-500">Retorno</p>
                              </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-slate-500" /> Hoje, 16:00
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Confirmado
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                             <button title="Ações Ocultas, consulta confirmada" className="p-2 text-emerald-500 bg-emerald-500/5 rounded-lg cursor-default border border-emerald-500/10">
                                <Check className="w-4 h-4" />
                            </button>
                            <button title="Mensagem no WhatsApp" className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-500/20">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                       </td>
                     </tr>
                     
                     <tr className="hover:bg-slate-800/30 transition-colors group">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-medium border border-slate-700">
                                  JL
                              </div>
                              <div>
                                  <p className="text-white font-medium">João Lucas</p>
                                  <p className="text-xs text-slate-500">Exame de Rotina</p>
                              </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Clock className="w-4 h-4 text-slate-500" /> Amanhã, 09:00
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Aguardando
                          </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button title="Confirmar Consulta" className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors border border-transparent hover:border-emerald-500/20">
                                <Check className="w-4 h-4" />
                            </button>
                            <button title="Cancelar Consulta" className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20">
                                <X className="w-4 h-4" />
                            </button>
                            <button title="Mensagem no WhatsApp" className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors border border-transparent hover:border-green-500/20">
                                <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                       </td>
                     </tr>

                   </tbody>
                 </table>
               </div>
             </div>

             {/* RIGHT: CALENDAR PANEL */}
             <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-white">Agenda Hoje</h2>
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Timeline Item */}
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-slate-500 pt-1 w-11 text-right">14:00</span>
                    </div>
                    <div className="absolute left-[3.25rem] top-2 bottom-[-1rem] w-px bg-slate-800"></div>
                    <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 relative">
                      <div className="absolute left-[-1.5rem] top-3.5 w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-slate-900"></div>
                      <h4 className="text-sm font-semibold text-emerald-400 mb-0.5">Retorno (Realizado)</h4>
                      <p className="text-xs text-slate-400">Arthur Silva</p>
                    </div>
                  </div>

                  {/* Timeline Item */}
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-semibold text-white pt-1 w-11 text-right">15:30</span>
                    </div>
                    <div className="absolute left-[3.25rem] top-2 bottom-[-1rem] w-px bg-slate-800"></div>
                    <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 relative">
                      <div className="absolute left-[-1.5rem] top-3.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-slate-900 animate-pulse"></div>
                      <h4 className="text-sm font-semibold text-indigo-400 mb-0.5">Primeira Consulta</h4>
                      <p className="text-xs text-slate-400">Mariana Barros</p>
                    </div>
                  </div>

                  {/* Timeline Item: Free Slot */}
                  <div className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-medium text-slate-500 pt-1 w-11 text-right">16:30</span>
                    </div>
                    <div className="flex-1 border border-dashed border-slate-700/50 rounded-xl p-3.5 py-5 flex items-center justify-center">
                      <p className="text-xs text-slate-500 font-medium">Horário Livre</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-6 py-2.5 rounded-lg border border-slate-800 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                  Ver calendário completo
                </button>
             </div>

           </div>
        </div>
      </main>
    </div>
  );
}
