"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Brain, MessageSquare, Zap, CheckCircle2, ShieldCheck, Activity } from "lucide-react";

export default function ParaMedicosPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-200">
      
      {/* NAVBAR B2B */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
               <Activity className="text-white w-5 h-5" />
             </div>
             MedFlow <span className="text-blue-600 text-sm ml-1 bg-blue-50 px-2 py-0.5 rounded-full">Para Clínicas</span>
           </Link>
           <div className="hidden md:flex items-center gap-6">
             <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
               Entrar
             </Link>
             <Link href="/signup" className="text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg">
               Começar Gratuitamente
             </Link>
           </div>
        </div>
      </nav>

      {/* HERO SECTION B2B */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-1/2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-bold mb-6 border border-blue-100">
             <Zap className="w-4 h-4" /> Plataforma All-in-One
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            Seu consultório operando no <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">piloto automático</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-8 leading-relaxed max-w-xl">
            Atraia mais pacientes, reduza faltas com lembretes automáticos no WhatsApp e centralize sua agenda e prontuários com IA.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1">
              Criar Conta Grátis
            </Link>
            <a href="#features" className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all hover:bg-slate-50">
              Ver Funções
            </a>
          </div>
          <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
             <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sem cartão de crédito</div>
             <div className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suporte VIP</div>
          </div>
        </div>
        
        {/* MOCKUP VISUAL */}
        <div className="lg:w-1/2 w-full relative">
           <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3"></div>
           <div className="relative bg-[#020617] rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
              {/* Header Mock */}
              <div className="h-10 border-b border-gray-800 flex items-center px-4 gap-2 bg-[#000000]">
                 <div className="w-3 h-3 rounded-full bg-red-500"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              {/* Body Mock */}
              <div className="p-6 flex flex-col gap-4">
                 <div className="flex justify-between items-center mb-2">
                    <div className="h-6 w-32 bg-slate-800 rounded-md"></div>
                    <div className="h-8 w-24 bg-blue-600/20 border border-blue-500/50 rounded-md"></div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                    <div className="h-24 bg-slate-800 rounded-xl"></div>
                 </div>
                 <div className="flex gap-4">
                    <div className="w-2/3 h-40 bg-slate-800 rounded-xl"></div>
                    <div className="w-1/3 h-40 bg-slate-800 rounded-xl"></div>
                 </div>
              </div>
           </div>
           
           {/* Flotating Card */}
           <div className="absolute -left-8 top-1/4 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden md:flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
             <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
             <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Novo Agendamento</p>
               <p className="text-sm font-bold text-slate-900">Dr. Marcos - 14:30</p>
             </div>
           </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">Tudo que uma clínica moderna exige.</h2>
            <p className="text-slate-500 text-lg">Substitua o papel, o painel do Excel e ferramentas obsoletas por um ecossistema projetado exclusivamente para profissionais de saúde.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {/* Feature 1 */}
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                  <LayoutDashboard className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Agenda Inteligente</h3>
                <p className="text-slate-600 leading-relaxed">Painel unificado. Sincronize horários, gerencie cancelamentos com 1 clique e veja sua escala em tempo real de qualquer dispositivo.</p>
             </div>

             {/* Feature 2 */}
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                  <Brain className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Prontuário com IA</h3>
                <p className="text-slate-600 leading-relaxed">Pare de digitar. Nosso sistema extrai resumos de IA das consultas, centralizando o histórico médico de forma organizada nas fichas dos pacientes.</p>
             </div>

             {/* Feature 3 */}
             <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                  <MessageSquare className="text-emerald-600 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Comunicação Whatsapp</h3>
                <p className="text-slate-600 leading-relaxed">Zere a taxa de "no-show". Envie mensagens de confirmação e lembretes automáticos diretamente para o WhatsApp do paciente com tags personalizadas.</p>
             </div>
          </div>
        </div>
      </section>

      {/* SEGURANÇA */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10 md:w-2/3">
             <ShieldCheck className="w-12 h-12 text-blue-400 mb-6" />
             <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Segurança e Conformidade</h2>
             <p className="text-slate-400 text-lg leading-relaxed">
               Nossa infraestrutura roda sobre o Supabase, garantindo que os relatórios confidenciais dos seus pacientes permaneçam isolados, criptografados e adequados às normas da LGPD.
             </p>
          </div>
          <div className="relative z-10 md:w-1/3 flex justify-center">
             <Link href="/signup" className="bg-white text-slate-900 hover:bg-slate-100 flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all shadow-xl">
               Blindar minha Clínica
             </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">Pronto para a nova era da medicina?</h2>
        <p className="text-slate-500 mb-10 text-lg">Crie seu perfil e esteja online no nosso buscador de agendamentos em menos de 5 minutos.</p>
        <Link href="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 text-lg">
          Começar Teste Gratuito <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

    </div>
  );
}
