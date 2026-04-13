"use client";

import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Menu, X } from "lucide-react";
import { MedsysLogo } from "@/components/Logo";
import { useState } from "react";

export default function PricingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
             <MedsysLogo className="h-8 w-auto drop-shadow-sm" />
             Medsys
           </Link>
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
             <Link href="/#beneficios" className="hover:text-emerald-600 transition-colors">Benefícios</Link>
             <Link href="/#como-funciona" className="hover:text-emerald-600 transition-colors">Como Funciona</Link>
             <Link href="/pricing" className="text-emerald-600 font-bold transition-colors">
               Planos
             </Link>
             <Link href="/para-medicos" className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
               Para Clínicas
             </Link>
           </div>
           
           <div className="flex items-center gap-3">
             <Link href="/login" className="hidden md:flex text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
               Acessar Conta
             </Link>
             <Link href="/login" className="md:hidden text-sm font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
               Entrar
             </Link>
             <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-600 p-1">
               {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
           </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl flex flex-col p-6 gap-6 z-50">
             <Link onClick={() => setMenuOpen(false)} href="/#beneficios" className="text-slate-700 font-medium text-lg">Benefícios</Link>
             <Link onClick={() => setMenuOpen(false)} href="/#como-funciona" className="text-slate-700 font-medium text-lg">Como Funciona</Link>
             <Link onClick={() => setMenuOpen(false)} href="/pricing" className="text-emerald-600 font-bold text-lg">Planos</Link>
             <Link onClick={() => setMenuOpen(false)} href="/para-medicos" className="text-emerald-600 font-bold text-lg">Para Clínicas</Link>
          </div>
        )}
      </nav>

      <main className="pt-32 pb-20 md:pt-40 md:pb-28 px-6 w-full">
        {/* TÍTULO */}
        <div className="text-center mb-16 max-w-3xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Planos desenhados para o tamanho da <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">sua clínica</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500">
            Experimente gratuitamente por 7 dias. Cancele a qualquer momento sem burocracias.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full items-center">

          {/* BÁSICO */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Básico</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">O essencial para profissionais autônomos iniciando digitalização.</p>

            <div className="mb-6">
               <span className="text-4xl font-extrabold text-slate-900">R$49</span>
               <span className="text-slate-500">/mês</span>
            </div>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 py-3 rounded-xl font-bold transition-colors mb-8"
            >
              Começar Grátis
            </Link>

            <ul className="space-y-4 text-slate-600 text-sm flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Agenda centralizada</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Confirmações manuais</li>
              <li className="flex items-center gap-3 text-slate-400"><XCircle className="w-5 h-5 shrink-0" /> Sem envio via WhatsApp</li>
              <li className="flex items-center gap-3 text-slate-400"><XCircle className="w-5 h-5 shrink-0" /> Sem resumos de IA</li>
            </ul>
          </div>

          {/* PROFISSIONAL (DESTAQUE) */}
          <div className="bg-[#020617] border border-slate-800 rounded-3xl p-8 shadow-2xl relative flex flex-col z-10 w-full md:scale-105">
            
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
              Mais Escolhido
            </div>

            <h2 className="text-2xl font-bold text-white mb-2 mt-2">Profissional</h2>
            <p className="text-slate-400 text-sm mb-6 h-10">Automação máxima para erradicar as faltas e os buracos na agenda.</p>

            <div className="mb-6">
               <span className="text-4xl font-extrabold text-white">R$99</span>
               <span className="text-slate-400">/mês</span>
            </div>

            <Link
              href="/signup"
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 py-4 rounded-xl font-extrabold transition-colors mb-8 shadow-lg shadow-emerald-500/20"
            >
              Assinar Profissional <ArrowRight className="w-4 h-4" />
            </Link>

            <ul className="space-y-4 text-slate-300 text-sm flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Tudo do plano Básico</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Disparos Lembretes WhatsApp</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Organização de Pacientes</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> Suporte em horário comercial</li>
            </ul>
          </div>

          {/* PREMIUM */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow w-full">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Premium</h2>
            <p className="text-slate-500 text-sm mb-6 h-10">Poder analítico avançado para grandes volumes de consultas.</p>

            <div className="mb-6">
               <span className="text-4xl font-extrabold text-slate-900">R$199</span>
               <span className="text-slate-500">/mês</span>
            </div>

            <Link
              href="/login"
              className="w-full flex items-center justify-center bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-bold transition-colors mb-8"
            >
              Falar com Consultor
            </Link>

            <ul className="space-y-4 text-slate-600 text-sm flex-1">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Tudo do Profissional</li>
              <li className="flex items-center gap-3 font-semibold text-slate-900"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Inteligência Medsys AI</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Extração de Resumos em Texto</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Gerente de Sucesso VIP (24/7)</li>
            </ul>
          </div>

        </div>

        {/* TRUST SIGNALS */}
        <div className="max-w-4xl mx-auto mt-24 text-center border-t border-slate-200 pt-16">
          <p className="text-slate-500 font-medium mb-6">Milhares de agendas em clínicas e consultórios protegidas pelo Medsys</p>
          <div className="flex flex-wrap items-center justify-center gap-10 opacity-40 grayscale">
             {/* Dummy logos representing trust */}
             <div className="text-xl font-bold tracking-tighter">CLINICA+</div>
             <div className="text-xl font-extrabold italic">health<span className="font-normal text-slate-400">group</span></div>
             <div className="text-xl font-bold uppercase tracking-widest">Global Med</div>
             <div className="text-xl font-serif italic">Santa Lúcia</div>
          </div>
        </div>

      </main>
    </div>
  );
}