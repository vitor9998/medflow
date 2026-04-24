"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight, Stethoscope, Search, Loader2, CalendarHeart, ShieldCheck, MapPin } from "lucide-react";
import { MedsysLogo } from "@/components/Logo";

export default function AgendamentoSelecaoPage() {
  const [medicos, setMedicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, especialidade, slug")
        .not("slug", "is", null);

      if (error) {
        console.log("Erro ao buscar médicos:", error);
        return;
      }

      setMedicos(data || []);
      setLoading(false);
    }

    load();
  }, []);

  const medicosFiltrados = medicos.filter(m => 
    m.nome?.toLowerCase().includes(filtro.toLowerCase()) || 
    m.especialidade?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans overflow-x-hidden selection:bg-emerald-200">
      
      {/* HEADER PACIENTE */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 py-4 px-6 fixed top-0 w-full z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <Link href="/" className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
             <MedsysLogo className="h-8 w-auto text-emerald-600 drop-shadow-sm" /> 
             Medsys
           </Link>
           <div className="flex items-center gap-4">
              <Link href="/paciente" className="text-sm text-slate-500 font-bold hidden sm:flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                 🧑 Portal do Paciente
              </Link>
              <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5">
                 👨‍⚕️ Área do Profissional
              </Link>
           </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24 w-full relative">
        
        {/* Glow Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

        {/* TÍTULO E BUSCA */}
        <div className="text-center mb-16 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-bold mb-6 border border-slate-200 shadow-sm">
             <CalendarHeart className="w-4 h-4 text-emerald-600" />
             Agendamento Inteligente
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-4 leading-tight">
            Encontre seu <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">especialista</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
            Selecione o profissional de saúde desejado. Você verá os horários reais disponíveis integrados à agenda da clínica na próxima etapa.
          </p>

          <div className="max-w-xl mx-auto relative px-2 sm:px-0 group">
             <div className="absolute inset-y-0 left-2 sm:left-4 flex items-center pointer-events-none transition-transform group-focus-within:scale-110 group-focus-within:text-emerald-500">
               <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
             </div>
             <input
               type="text"
               placeholder="Buscar Dr. Carlos, Cardiologia..."
               value={filtro}
               onChange={(e) => setFiltro(e.target.value)}
               className="w-full pl-12 sm:pl-12 pr-4 py-4 sm:py-5 rounded-full border border-slate-200 bg-white shadow-lg shadow-slate-200/50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-slate-700 text-lg font-medium"
             />
          </div>

          {/* Results count */}
          {!loading && filtro && (
            <p className="mt-4 text-sm font-bold text-slate-400">
              {medicosFiltrados.length} {medicosFiltrados.length === 1 ? 'resultado' : 'resultados'} encontrado{medicosFiltrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-emerald-600 w-full animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Conectando à rede de especialistas...</p>
          </div>
        )}

        {/* GRID DE MÉDICOS */}
        {!loading && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {medicosFiltrados.map((m, index) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200 p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-emerald-900/10 hover:border-emerald-300 transition-all duration-300 group flex flex-col w-full relative overflow-hidden"
                style={{ animationDelay: `${index * 80}ms`, animation: 'fadeInUp 0.5s ease-out both' }}
              >
                {/* Gradient accent on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-slate-600 font-extrabold text-2xl shrink-0 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white group-hover:border-emerald-500 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-emerald-500/25 group-hover:-translate-y-1">
                    {m.nome?.charAt(0)?.toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight truncate mb-1.5">
                      {m.nome}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 uppercase tracking-wide">
                      <Stethoscope className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{m.especialidade || "Especialista"}</span>
                    </span>
                  </div>
                </div>

                {/* Availability hint */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Agenda disponível para agendamento
                </div>

                <div className="mt-auto pt-5 border-t border-slate-100 w-full relative z-10">
                  <Link
                    href={`/agendamento/${m.slug}`}
                    className="flex items-center justify-center w-full bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg gap-2 group-hover:bg-emerald-600 group-hover:shadow-emerald-600/20"
                  >
                    <span>Ver horários livres</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Trust Footer */}
          {medicosFiltrados.length > 0 && (
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Dados protegidos por criptografia</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><CalendarHeart className="w-3.5 h-3.5 text-emerald-500" /> Confirmação instantânea</span>
            </div>
          )}
          </>
        )}

        {/* EMPTY STATE */}
        {!loading && medicosFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-[2rem] w-full max-w-3xl mx-auto shadow-sm">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
               <Stethoscope className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Nenhum médico encontrado</h3>
            <p className="text-slate-500 max-w-md mx-auto text-lg font-medium mb-6">Não achamos profissionais com os termos informados. Verifique se a busca está correta.</p>
            {filtro && (
              <button 
                onClick={() => setFiltro("")}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                ← Limpar busca
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}