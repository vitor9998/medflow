"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { ArrowRight, Search, Loader2, Calendar, ShieldCheck, ChevronLeft } from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function AgendamentoSelecaoEditorial() {
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

  const medicosFiltrados = medicos.filter((m: any) => 
    m.nome?.toLowerCase().includes(filtro.toLowerCase()) || 
    m.especialidade?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50`}>
      
      {/* MINIMALIST HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 px-6 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto text-emerald-900" /> 
           </Link>
           <Link href="/" className="text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity text-stone-500">
              <ChevronLeft className="w-4 h-4" /> Página Inicial
           </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32 w-full relative">
        
        {/* EDITORIAL HEADER & SEARCH */}
        <div className="text-center mb-24 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-900/10 bg-emerald-900/5 text-emerald-900 text-xs font-semibold tracking-widest uppercase mb-8">
             <Calendar className="w-3.5 h-3.5" />
             Especialistas
          </div>
          
          <h1 className={`${playfair.className} text-5xl sm:text-6xl md:text-7xl font-semibold text-stone-900 leading-[1.05] tracking-tight mb-8`}>
            Encontre o <span className="italic text-emerald-900">cuidado ideal</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-500 font-light max-w-2xl leading-relaxed mb-16">
            Explore nossa rede de especialistas altamente qualificados e agende sua consulta com praticidade e exclusividade.
          </p>

          <div className="max-w-2xl w-full mx-auto relative group">
             <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-transform group-focus-within:scale-110">
               <Search className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-900 transition-colors" />
             </div>
             <input
               type="text"
               placeholder="Busque por nome ou especialidade..."
               value={filtro}
               onChange={(e) => setFiltro(e.target.value)}
               className="w-full pl-14 pr-6 py-5 rounded-2xl border border-stone-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition-all text-stone-800 text-lg font-light placeholder-stone-400"
             />
          </div>

          {/* Results count */}
          {!loading && filtro && (
            <p className="mt-6 text-xs uppercase tracking-widest font-semibold text-stone-400">
              {medicosFiltrados.length} {medicosFiltrados.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
            </p>
          )}
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-emerald-900 w-full">
            <Loader2 className="w-10 h-10 animate-spin mb-6 stroke-[1.5px]" />
            <p className="text-xs uppercase tracking-widest font-semibold text-stone-500">Conectando à rede...</p>
          </div>
        )}

        {/* DOCTOR GRID */}
        {!loading && (
          <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {medicosFiltrados.map((m: any, index: number) => {
              const inicial = m.nome?.replace('Dr. ', '')?.replace('Dra. ', '')?.charAt(0)?.toUpperCase() || "M";
              const nomeFormatado = m.nome?.startsWith('Dr') ? m.nome : `Dr. ${m.nome}`;
              
              return (
                <div
                  key={m.id}
                  className="bg-white border border-stone-200 p-8 rounded-2xl hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:border-emerald-900/20 transition-all duration-500 group flex flex-col w-full relative"
                >
                  <div className="flex items-start gap-6 mb-8">
                    <div className={`${playfair.className} w-16 h-16 bg-[#FDFCF8] border border-stone-200 rounded-full flex items-center justify-center text-emerald-900 text-3xl italic shrink-0 group-hover:bg-emerald-900 group-hover:text-stone-50 transition-colors duration-500`}>
                      {inicial}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h2 className={`${playfair.className} text-2xl text-stone-900 leading-tight truncate mb-2`}>
                        {nomeFormatado}
                      </h2>
                      <span className="text-xs uppercase tracking-widest text-stone-500 font-semibold block truncate">
                        {m.especialidade || "Especialista"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 border-t border-stone-100 w-full">
                    <Link
                      href={`/perfil/${m.slug}`}
                      className="flex items-center justify-between w-full text-stone-500 group-hover:text-emerald-900 font-medium transition-colors text-sm uppercase tracking-widest"
                    >
                      <span>Ver perfil completo</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Trust Footer */}
          {medicosFiltrados.length > 0 && (
            <div className="mt-24 flex flex-col sm:flex-row items-center justify-center gap-8 text-xs uppercase tracking-widest font-semibold text-stone-400">
              <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-900/50" /> Ambiente Seguro</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300"></span>
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-900/50" /> Confirmação Imediata</span>
            </div>
          )}
          </>
        )}

        {/* EMPTY STATE */}
        {!loading && medicosFiltrados.length === 0 && (
          <div className="text-center py-32 bg-white border border-stone-200 rounded-2xl w-full max-w-4xl mx-auto">
            <div className={`${playfair.className} text-6xl italic text-stone-200 mb-6`}>?</div>
            <h3 className={`${playfair.className} text-3xl text-stone-900 mb-4`}>Nenhum profissional encontrado</h3>
            <p className="text-stone-500 max-w-md mx-auto text-lg font-light mb-8">Refine sua busca por nome ou especialidade para encontrar o cuidado ideal.</p>
            {filtro && (
              <button 
                onClick={() => setFiltro("")}
                className="text-xs uppercase tracking-widest font-semibold text-emerald-900 hover:text-emerald-700 transition-colors"
              >
                Limpar busca
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}