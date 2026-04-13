"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Brain, MessageSquare, Zap, CheckCircle2, ShieldCheck } from "lucide-react";
import { MedsysLogo } from "@/components/Logo";

export default function ParaMedicosPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 overflow-x-hidden">
      
      {/* NAVBAR B2B */}
      <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
             <MedsysLogo className="h-8 w-auto" />
             Medsys <span className="text-emerald-700 text-[10px] sm:text-xs ml-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider font-extrabold hidden xs:inline-block">Para Clínicas</span>
           </Link>
           <div className="hidden md:flex items-center gap-6">
             <Link href="/pricing" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
               Planos
             </Link>
             <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
               Entrar
             </Link>
             <Link href="/signup" className="text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
               Começar Grátis
             </Link>
           </div>
           <div className="md:hidden">
             <Link href="/signup" className="text-sm font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg">
               Criar Conta
             </Link>
           </div>
        </div>
      </nav>

      {/* HERO SECTION B2B */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="w-full lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-6 border border-emerald-100 shadow-sm">
             <Zap className="w-4 h-4 text-emerald-500" /> Sistema Integrado
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Consultório rodando no <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">piloto automático</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-xl">
            Zere as faltas diárias com os lembretes do WhatsApp e deixe a plataforma Medsys organizar o seu prontuário em poucos cliques.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/30 w-full sm:w-auto hover:-translate-y-0.5">
              Começar Período Gratuito
            </Link>
            <a href="#features" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all w-full sm:w-auto hover:-translate-y-0.5">
               Tour Rápido
            </a>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem fidelidade</div>
             <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Importação de dados fácil</div>
          </div>
        </div>
        
        {/* MOCKUP VISUAL */}
        <div className="w-full lg:w-1/2 relative hidden sm:block">
           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-[3rem] transform rotate-3"></div>
           <div className="relative bg-[#020617] rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
              {/* Header Mock */}
              <div className="h-10 border-b border-gray-800 flex items-center justify-between px-4 bg-[#000000]">
                 <div className="flex gap-2">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 </div>
                 <div className="opacity-80 grayscale scale-75">
                   <MedsysLogo className="h-5" />
                 </div>
              </div>
              {/* Body Mock */}
              <div className="p-6 flex flex-col gap-4">
                 <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-32 bg-slate-800 rounded-md"></div>
                    <div className="h-8 w-24 bg-emerald-600/20 border border-emerald-500/50 rounded-md"></div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-20 bg-slate-800 rounded-xl relative overflow-hidden"><div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div></div>
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                    <div className="h-20 bg-slate-800 rounded-xl"></div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-2/3 h-36 bg-slate-800 rounded-xl"></div>
                    <div className="w-1/3 h-36 bg-slate-800 rounded-xl"></div>
                 </div>
              </div>
           </div>
           
           {/* Floating Alert Card */}
           <div className="absolute -left-6 top-1/3 bg-white p-4 rounded-xl shadow-2xl border border-slate-100 lg:flex items-center gap-3 animate-bounce" style={{ animationDuration: '3.5s' }}>
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 shrink-0"><CheckCircle2 className="w-5 h-5"/></div>
             <div>
               <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Agendamento Online</p>
               <p className="text-sm font-bold text-slate-900">Novo Paciente - 14:30</p>
             </div>
           </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">O essencial da clínica moderna.</h2>
            <p className="text-slate-500 text-lg">Pare de gastar dinheiro com papéis ou ferramentas fragmentadas. Um ecossistema único resolve seu backoffice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
             {/* Feature 1 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-emerald-600">
                  <LayoutDashboard className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda Unificada</h3>
                <p className="text-slate-600 leading-relaxed">Conecte toda a recepção. Mova horários, visualize buracos e analise a fila de espera diária sincronizada onde você estiver.</p>
             </div>

             {/* Feature 2 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-emerald-600">
                  <Brain className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Resumo IA</h3>
                <p className="text-slate-600 leading-relaxed">Nosso CRM interno estrutura as observações dos pacientes utilizando IA para focar nos sintomas crus antes da consulta iniciar.</p>
             </div>

             {/* Feature 3 */}
             <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-inner text-emerald-600">
                  <MessageSquare className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Bot no WhatsApp</h3>
                <p className="text-slate-600 leading-relaxed">Encaminhe confirmações e crie lembretes invisíveis que chegam no celular do paciente automaticamente na véspera do exame.</p>
             </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="py-24 max-w-7xl mx-auto px-6 w-full">
        <div className="bg-[#020617] rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-transparent"></div>
          <div className="relative z-10 w-full md:w-2/3">
             <ShieldCheck className="w-12 h-12 text-emerald-400 mb-6" />
             <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Segurança Global de Nível Bancário</h2>
             <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
               Sua base roda encriptada sob parceiros validados internacionalmente, assegurando compatibilidade com as mais estritas regras da LGPD no manuseio de históricos confidenciais.
             </p>
          </div>
          <div className="relative z-10 w-full md:w-1/3 flex justify-start md:justify-end">
             <Link href="/signup" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 flex items-center justify-center w-full md:w-auto px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 whitespace-nowrap">
               Blindar minha Clínica
             </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 text-center px-6 w-full max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">O digitalizado custa muito menos que o esquecimento.</h2>
        <p className="text-slate-500 mb-10 text-lg md:text-xl max-w-2xl mx-auto">Coloque a sua reputação médica na vitrine. Abra sua conta no Medsys, cadastre sua agenda de atendimentos e atraia demandas ativas da região.</p>
        <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-600/20 text-lg mx-auto transform hover:-translate-y-1 hover:scale-105 duration-300">
          Iniciar Meu Consultório Online <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

    </div>
  );
}
