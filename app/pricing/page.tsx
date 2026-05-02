"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ChevronLeft, Calendar, ShieldCheck, Sparkles } from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function PricingEditorial() {
  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50 overflow-x-hidden`}>
      
      {/* MINIMALIST HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 px-6 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto text-emerald-900" /> 
           </Link>
           <Link href="/" className="text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity text-stone-500">
              <ChevronLeft className="w-4 h-4" /> Voltar
           </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-40 pb-32 w-full relative">
        
        {/* EDITORIAL HEADER */}
        <div className="text-center mb-24 w-full flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-900/10 bg-emerald-900/5 text-emerald-900 text-xs font-semibold tracking-widest uppercase mb-8">
             <Sparkles className="w-3.5 h-3.5" />
             Investimento
          </div>
          
          <h1 className={`${playfair.className} text-5xl sm:text-6xl md:text-7xl font-semibold text-stone-900 leading-[1.05] tracking-tight mb-8 max-w-4xl`}>
            Excelência sob medida para <br/><span className="italic text-emerald-900">a sua clínica</span>.
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-500 font-light max-w-2xl leading-relaxed mb-6">
            Eleve o padrão do seu atendimento com um sistema pensado para médicos que valorizam o tempo e a exclusividade.
          </p>
          <p className="text-sm tracking-widest uppercase font-semibold text-stone-400">
            Cancele a qualquer momento • Sem burocracia
          </p>
        </div>

        {/* ELEGANT PRICING CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full items-stretch">

          {/* BÁSICO */}
          <div className="bg-white border border-stone-200 rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-emerald-900/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all">
            <h2 className={`${playfair.className} text-3xl text-stone-900 mb-4`}>Essencial</h2>
            <p className="text-stone-500 text-sm font-light mb-10 h-10">O ponto de partida para organizar sua prática privada com elegância.</p>

            <div className="mb-10 flex items-baseline gap-2">
               <span className={`${playfair.className} text-5xl text-stone-900`}>R$49</span>
               <span className="text-stone-400 text-sm tracking-widest uppercase font-semibold">/mês</span>
            </div>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center bg-[#FDFCF8] hover:bg-stone-50 text-stone-800 border border-stone-200 py-4 rounded-xl font-medium transition-all mb-10"
            >
              Iniciar Grátis
            </Link>

            <ul className="space-y-5 text-stone-600 text-sm flex-1 font-light">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-900/60 shrink-0 mt-0.5" /> Agenda centralizada e minimalista</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-900/60 shrink-0 mt-0.5" /> Confirmações manuais</li>
              <li className="flex items-start gap-3 text-stone-400"><div className="w-5 h-px bg-stone-300 mt-2.5 shrink-0"></div> Sem automação via WhatsApp</li>
              <li className="flex items-start gap-3 text-stone-400"><div className="w-5 h-px bg-stone-300 mt-2.5 shrink-0"></div> Sem concierge com IA</li>
            </ul>
          </div>

          {/* PROFISSIONAL (DESTAQUE) */}
          <div className="bg-emerald-900 border border-emerald-800 rounded-2xl p-10 shadow-2xl shadow-emerald-900/20 relative flex flex-col z-10 md:scale-105 text-stone-50">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-400 rounded-t-2xl"></div>

            <h2 className={`${playfair.className} text-3xl text-white mb-4 mt-2`}>Profissional</h2>
            <p className="text-emerald-100/70 text-sm font-light mb-10 h-10">Automação sofisticada para uma agenda sempre cheia e pacientes encantados.</p>

            <div className="mb-10 flex items-baseline gap-2">
               <span className={`${playfair.className} text-5xl text-white`}>R$99</span>
               <span className="text-emerald-200/50 text-sm tracking-widest uppercase font-semibold">/mês</span>
            </div>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 bg-[#FDFCF8] hover:bg-white text-emerald-900 py-4 rounded-xl font-medium transition-all mb-10 group"
            >
              Assinar Profissional <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <ul className="space-y-5 text-emerald-100/90 text-sm flex-1 font-light">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> Tudo do plano Essencial</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> Disparos e Lembretes via WhatsApp</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> Gestão Completa de Pacientes</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> Suporte Prioritário</li>
            </ul>
          </div>

          {/* PREMIUM */}
          <div className="bg-white border border-stone-200 rounded-2xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col hover:border-emerald-900/20 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] transition-all">
            <h2 className={`${playfair.className} text-3xl text-stone-900 mb-4`}>Exclusive</h2>
            <p className="text-stone-500 text-sm font-light mb-10 h-10">Poder analítico avançado e IA para grandes volumes e clínicas de luxo.</p>

            <div className="mb-10 flex items-baseline gap-2">
               <span className={`${playfair.className} text-5xl text-stone-900`}>R$199</span>
               <span className="text-stone-400 text-sm tracking-widest uppercase font-semibold">/mês</span>
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center bg-white hover:bg-stone-50 text-stone-800 border border-stone-200 py-4 rounded-xl font-medium transition-all mb-10"
            >
              Falar com Concierge
            </Link>

            <ul className="space-y-5 text-stone-600 text-sm flex-1 font-light">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-900/60 shrink-0 mt-0.5" /> Tudo do plano Profissional</li>
              <li className="flex items-start gap-3 text-stone-900 font-medium"><CheckCircle2 className="w-5 h-5 text-emerald-900 shrink-0 mt-0.5" /> Inteligência ZyntraMed AI</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-900/60 shrink-0 mt-0.5" /> Resumos textuais automáticos</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-900/60 shrink-0 mt-0.5" /> Gerente de Conta VIP (24/7)</li>
            </ul>
          </div>

        </div>

        {/* TRUST SIGNALS */}
        <div className="max-w-4xl mx-auto mt-32 text-center border-t border-stone-200/60 pt-16">
          <p className="text-stone-400 text-sm tracking-widest uppercase font-semibold mb-10">
            A escolha da excelência médica
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-30 grayscale mix-blend-multiply">
             <div className={`${playfair.className} text-2xl tracking-tighter`}>CLINICA+</div>
             <div className={`${playfair.className} text-2xl italic`}>health<span className="text-stone-400">group</span></div>
             <div className="text-xl uppercase tracking-[0.2em] font-light">Global Med</div>
             <div className={`${playfair.className} text-2xl italic`}>Santa Lúcia</div>
          </div>
        </div>

      </main>
    </div>
  );
}