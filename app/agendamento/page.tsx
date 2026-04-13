"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight, Stethoscope, Search, Loader2 } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
      
      {/* HEADER SIMPLES */}
      <header className="bg-white border-b border-slate-200 py-6 px-6 relative z-10 w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
           <Link href="/" className="font-bold text-xl text-emerald-600 flex items-center gap-2">
             <MedsysLogo className="h-8 w-auto" /> 
             Medsys
           </Link>
           <div className="text-sm text-slate-500 font-medium hidden sm:block">Suporte ao Paciente</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20 w-full">
        
        {/* TÍTULO E BUSCA */}
        <div className="text-center mb-16 w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Escolha o especialista
          </h1>
          <p className="text-base sm:text-lg text-slate-500 max-w-2xl mx-auto mb-10">
            Selecione o médico para dar continuidade ao seu agendamento. Você verá os horários reais disponíveis na próxima etapa.
          </p>

          <div className="max-w-xl mx-auto relative px-2 sm:px-0">
             <div className="absolute inset-y-0 left-2 sm:left-0 pl-4 flex items-center pointer-events-none">
               <Search className="h-5 w-5 text-slate-400" />
             </div>
             <input
               type="text"
               placeholder="Buscar por nome ou especialidade..."
               value={filtro}
               onChange={(e) => setFiltro(e.target.value)}
               className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-700"
             />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-emerald-600 w-full">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Buscando especialistas disponíveis na nossa rede...</p>
          </div>
        )}

        {/* GRID DE MÉDICOS */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {medicosFiltrados.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-slate-200 p-6 rounded-3xl hover:shadow-xl hover:shadow-emerald-900/10 hover:border-emerald-300 transition-all duration-300 group flex flex-col w-full"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {m.nome?.charAt(0)?.toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">
                      {m.nome}
                    </h2>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-slate-600 text-[11px] font-semibold mt-2 border border-slate-100 uppercase tracking-wider">
                      <Stethoscope className="w-3 h-3 text-emerald-500 shrink-0" /> <span className="truncate">{m.especialidade}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 w-full">
                  <Link
                    href={`/agendamento/${m.slug}`}
                    className="flex items-center justify-center w-full bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white px-5 py-3 rounded-xl font-bold transition-all group-hover:shadow-md gap-2"
                  >
                    <span>Ver agenda livre</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && medicosFiltrados.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl w-full max-w-3xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
               <Stethoscope className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum médico encontrado</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Não encontramos nenhum profissional com os termos informados. Verifique se a busca está correta.</p>
          </div>
        )}

      </main>
    </div>
  );
}