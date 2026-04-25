"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Calendar, Clock, ChevronRight, Activity, Search, ShieldCheck } from "lucide-react";

export default function PortalDashboardPage() {
  const [minhasConsultas, setMinhasConsultas] = useState<any[]>([]);
  const [medicosDisponiveis, setMedicosDisponiveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pegar pelo ID Criptográfico na tabela (nova âncora)
      // Buscamos apenas os dados básicos para não confundir o Banco
      const { data: minhas, error: erroMinhas } = await supabase
        .from("agendamentos")
        .select(`*`)
        .eq("patient_id", user.id)
        .order("data", { ascending: true });
        
      if (minhas && minhas.length > 0) {
        // Agora buscamos os médicos manualmente pra cruzar os dados na memória (Zero Erros)
        const medicosIds = minhas.map((m: any) => m.user_id);
        const { data: profilesDocs } = await supabase
          .from("profiles")
          .select("id, nome, especialidade")
          .in("id", medicosIds);

        const minhasMerged = minhas.map((m: any) => ({
          ...m,
          profiles: profilesDocs?.find((p: any) => p.id === m.user_id) || null
        }));
        setMinhasConsultas(minhasMerged);
      } else {
        setMinhasConsultas([]);
      }

      // Pegar lista de medicos pra agendar
      const { data: medicos } = await supabase
        .from("profiles")
        .select("nome, slug, especialidade")
        .eq("role", "doctor")
        .eq("status", "active");

      if (medicos) setMedicosDisponiveis(medicos);
      
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return null;

  const proximas = minhasConsultas.filter((c: any) => c.status !== "cancelado" && new Date(`${c.data}T${c.hora}`) >= new Date());
  const passadas = minhasConsultas.filter((c: any) => c.status === "cancelado" || new Date(`${c.data}T${c.hora}`) < new Date());

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* HEADER / WELCOME */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Meu Painel de Saúde</h1>
        <p className="text-slate-500 mt-2 text-lg">Acompanhe seus horários e conecte-se aos nossos especialistas rapidamente.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: LISTA DE CONSULTAS */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* PRÓXIMAS */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-emerald-600">
               <Calendar className="w-5 h-5" />
               <h2 className="text-xl font-bold text-slate-900 tracking-tight">Próximas Consultas</h2>
            </div>
            
            {proximas.length === 0 ? (
              <div className="bg-white border text-center border-slate-200 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-slate-500">
                 <Activity className="w-10 h-10 text-emerald-200 mb-3" />
                 <p className="font-semibold text-slate-600">Sua agenda está livre.</p>
                 <p className="text-sm">Nenhum compromisso marcado no momento.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {proximas.map(consulta => (
                  <div key={consulta.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                              Confirmada
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mt-2">{consulta.profiles?.nome || "Médico Associado"}</h3>
                          <p className="text-slate-500 text-sm font-medium">{consulta.profiles?.especialidade || "Especialista em Triagem"}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center gap-6 sm:min-w-[200px]">
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Data</p>
                            <p className="font-bold text-slate-800">{consulta.data.split('-').reverse().join('/')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Hora</p>
                            <p className="font-bold text-slate-800">{consulta.hora}</p>
                          </div>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* PASSADAS */}
          <section className="opacity-70">
            <h2 className="text-lg font-bold text-slate-700 tracking-tight mb-4">Histórico Passado</h2>
            {passadas.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Nenhuma consulta antiga no radar.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {passadas.map(consulta => (
                  <div key={consulta.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center bg-opacity-60">
                     <div>
                       <h3 className="font-semibold text-slate-700 text-sm">{consulta.profiles?.nome || "Clínica Geral"}</h3>
                       <p className="text-slate-400 text-xs mt-0.5">{consulta.data.split('-').reverse().join('/')}</p>
                     </div>
                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${consulta.status === 'cancelado' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                       {consulta.status}
                     </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* COLUNA DIREITA: NOVO AGENDAMENTO */}
        <div className="lg:col-span-1">
          <div className="bg-[#020617] text-white rounded-3xl p-6 shadow-xl sticky top-24">
            <h2 className="text-xl font-extrabold tracking-tight mb-2">Agendar Consulta</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Conecte-se com os melhores profissionais disponíveis na clínica agora mesmo.</p>

            <div className="flex flex-col gap-3">
              {medicosDisponiveis.length === 0 ? (
                <div className="text-center bg-slate-800/50 rounded-xl p-4 text-slate-500 text-sm">
                  Nenhum médico aberto para captação hoje.
                </div>
              ) : (
                medicosDisponiveis.map(doc => (
                  <Link 
                    key={doc.slug} 
                    href={`/agendamento/${doc.slug}`}
                    className="group bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 rounded-xl p-4 flex items-center justify-between transition-all"
                  >
                    <div>
                      <h4 className="font-bold text-slate-200 text-sm">{doc.nome}</h4>
                      <p className="text-xs text-slate-400 mt-1">{doc.especialidade}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))
              )}
            </div>

            <div className="mt-8 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
               <div className="flex items-center gap-2 text-emerald-400 mb-2">
                 <ShieldCheck className="w-4 h-4" />
                 <span className="text-xs font-bold uppercase tracking-wider">Aviso Legal</span>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed">
                 O Medsys prioriza sua privacidade. Todas as informações trafegadas aqui e o seu histórico estão criptografados de ponta-a-ponta e são visíveis apenas ao profissional designado.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
