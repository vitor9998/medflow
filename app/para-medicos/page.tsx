"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Brain, MessageSquare, ShieldCheck, CheckCircle2, ChevronRight } from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";
import { Playfair_Display, Inter } from "next/font/google";
import { useState, useEffect } from "react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function ParaMedicosEditorial() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50 overflow-x-hidden`}>
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-emerald-900 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto text-emerald-900" />
           </Link>
           <div className="hidden md:flex items-center gap-10 text-xs tracking-widest uppercase font-semibold text-stone-500">
             <a href="#features" className="hover:text-emerald-900 transition-colors">A Solução</a>
             <Link href="/pricing" className="hover:text-emerald-900 transition-colors">Investimento</Link>
           </div>
           
           <div className="flex items-center gap-6">
             <Link href="/login" className="hidden md:flex text-xs tracking-widest uppercase font-semibold text-stone-500 hover:text-emerald-900 transition-colors">
               Acesso
             </Link>
             <Link href="/signup" className="text-xs tracking-widest uppercase font-semibold text-white bg-emerald-900 hover:bg-emerald-800 px-6 py-3 rounded-full transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
               Criar Conta
             </Link>
           </div>
        </div>
      </nav>

      {/* EDITORIAL HERO */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/5 text-emerald-900 text-xs font-semibold tracking-widest uppercase mb-8 border border-emerald-900/10">
             Gestão para Clínicas
          </div>
          
          <h1 className={`${playfair.className} text-5xl sm:text-6xl md:text-7xl font-semibold text-stone-900 mb-8 max-w-4xl leading-[1.05] tracking-tight`}>
            O seu consultório no <span className="italic text-emerald-900">piloto automático</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-500 mb-12 max-w-2xl leading-relaxed font-light">
            Zere as faltas diárias com inteligência artificial e eleve o padrão de atendimento da sua clínica.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto mb-10">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-5 rounded-full font-medium tracking-wide transition-all shadow-xl text-lg hover:-translate-y-1 group">
              Começar Período Gratuito <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#FDFCF8] hover:bg-stone-50 text-stone-800 border border-stone-200 px-10 py-5 rounded-full font-medium transition-all text-lg hover:border-stone-300">
              Conhecer a solução
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 text-xs tracking-widest uppercase font-semibold text-stone-400">
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-900/50" /> Sem fidelidade</span>
             <span className="hidden sm:block w-1 h-1 rounded-full bg-stone-300"></span>
             <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-900/50" /> Importação rápida</span>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-32 bg-white w-full border-y border-stone-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className={`${playfair.className} text-4xl md:text-5xl text-stone-900 mb-6 tracking-tight leading-tight`}>A essência da clínica de luxo.</h2>
            <p className="text-stone-500 text-lg font-light leading-relaxed">
              Substitua ferramentas fragmentadas por um ecossistema projetado para a alta performance médica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <div className="bg-[#FDFCF8] p-10 rounded-2xl border border-stone-200/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:border-emerald-900/20 transition-all">
                <div className="w-14 h-14 bg-emerald-900/5 rounded-full flex items-center justify-center mb-8 text-emerald-900">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className={`${playfair.className} text-2xl text-stone-900 mb-4`}>Agenda Unificada</h3>
                <p className="text-stone-500 font-light leading-relaxed text-sm">
                  Conecte a recepção. Mova horários, visualize espaços vagos e sincronize sua rotina de qualquer lugar, com total fluidez.
                </p>
             </div>

             <div className="bg-[#FDFCF8] p-10 rounded-2xl border border-stone-200/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:border-emerald-900/20 transition-all">
                <div className="w-14 h-14 bg-emerald-900/5 rounded-full flex items-center justify-center mb-8 text-emerald-900">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className={`${playfair.className} text-2xl text-stone-900 mb-4`}>Dossiê Inteligente</h3>
                <p className="text-stone-500 font-light leading-relaxed text-sm">
                  Prontuários e histórico consolidados. Acesse informações clínicas cruciais em uma interface limpa, focada no paciente.
                </p>
             </div>

             <div className="bg-[#FDFCF8] p-10 rounded-2xl border border-stone-200/60 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] hover:border-emerald-900/20 transition-all">
                <div className="w-14 h-14 bg-emerald-900/5 rounded-full flex items-center justify-center mb-8 text-emerald-900">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className={`${playfair.className} text-2xl text-stone-900 mb-4`}>Concierge Digital</h3>
                <p className="text-stone-500 font-light leading-relaxed text-sm">
                  O sistema gerencia confirmações e lembretes via WhatsApp automaticamente, operando silenciosamente nos bastidores.
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* ELEGANT SECURITY */}
      <section className="py-32 w-full bg-emerald-900 text-stone-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
               <ShieldCheck className="w-12 h-12 text-emerald-400 mb-8 stroke-[1.5px]" />
               <h2 className={`${playfair.className} text-4xl md:text-5xl text-white mb-6 leading-tight`}>
                 O mais alto padrão de <span className="italic text-emerald-300">privacidade</span>.
               </h2>
               <p className="text-emerald-100/80 text-lg font-light leading-relaxed mb-10">
                 Os dados dos seus pacientes estão protegidos por criptografia de ponta e em total conformidade com a LGPD, oferecendo a tranquilidade que a sua clínica exige.
               </p>
               <Link href="/signup" className="inline-flex items-center gap-3 text-sm tracking-widest uppercase font-semibold text-emerald-300 hover:text-white transition-colors group">
                 Proteger minha clínica <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
            
            {/* Visual representation of security */}
            <div className="relative">
               <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-emerald-950 rounded-[2rem] transform rotate-3"></div>
               <div className="relative bg-stone-900 rounded-2xl p-10 border border-stone-800 shadow-2xl flex flex-col gap-6">
                 <div className="flex justify-between items-center border-b border-stone-800 pb-4">
                   <div className="w-24 h-4 bg-stone-800 rounded"></div>
                   <div className="w-10 h-4 bg-emerald-900/50 rounded text-[10px] text-emerald-500 text-center font-bold">SECURE</div>
                 </div>
                 <div className="space-y-4">
                   <div className="w-full h-12 bg-stone-800/50 rounded-lg flex items-center px-4"><div className="w-3 h-3 rounded-full bg-emerald-500/50 mr-4"></div><div className="w-1/2 h-2 bg-stone-700 rounded"></div></div>
                   <div className="w-full h-12 bg-stone-800/50 rounded-lg flex items-center px-4"><div className="w-3 h-3 rounded-full bg-emerald-500/50 mr-4"></div><div className="w-2/3 h-2 bg-stone-700 rounded"></div></div>
                   <div className="w-full h-12 bg-stone-800/50 rounded-lg flex items-center px-4"><div className="w-3 h-3 rounded-full bg-emerald-500/50 mr-4"></div><div className="w-1/3 h-2 bg-stone-700 rounded"></div></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-32 bg-[#F4F1EA] text-center w-full">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className={`${playfair.className} text-4xl md:text-5xl text-stone-900 mb-8 leading-tight`}>Assuma o controle da sua agenda.</h2>
          <p className="text-stone-500 text-xl font-light mb-12">Digitalize sua prática com elegância e foco exclusivo na medicina.</p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-5 rounded-full font-medium tracking-wide transition-all shadow-xl text-lg hover:-translate-y-1 group">
            Iniciar setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

    </div>
  );
}
