"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Star, ShieldCheck, Activity, Stethoscope } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-200">
      
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
               <Activity className="text-white w-5 h-5" />
             </div>
             MedFlow
           </div>
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
             <a href="#beneficios" className="hover:text-blue-600 transition-colors">Benefícios</a>
             <a href="#como-funciona" className="hover:text-blue-600 transition-colors">Como Funciona</a>
             <Link href="/para-medicos" className="text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
               Para Médicos
             </Link>
           </div>
           <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all">
             Acessar Conta
           </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 animate-fade-in-up">
           <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
           O futuro do agendamento clínico
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          Agende sua consulta sem  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">complicações</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Encontre o especialista ideal e garanta seu horário de forma totalmente digital, segura e sem filas de espera.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/agendamento" className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-lg hover:-translate-y-0.5">
            Agendar Consulta Agora <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#como-funciona" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all text-lg hover:-translate-y-0.5">
            Saber mais
          </a>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="py-24 bg-white border-y border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que escolher o MedFlow?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tudo foi desenhado para colocar a sua saúde em primeiro lugar com máxima eficiência.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-blue-900/5 transition-all">
               <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                 <Clock className="w-6 h-6 text-blue-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Agilidade Total</h3>
               <p className="text-slate-600 leading-relaxed">Não perca horas no telefone. Escolha a data e hora perfeitas para você diretamente pelo seu celular.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-900/5 transition-all">
               <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                 <ShieldCheck className="w-6 h-6 text-indigo-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança de Dados</h3>
               <p className="text-slate-600 leading-relaxed">Seu histórico médico e dados de contato são criptografados de ponta-a-ponta, seguindo regulamentos rígidos.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-900/5 transition-all">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                 <Stethoscope className="w-6 h-6 text-emerald-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Especialistas Renomados</h3>
               <p className="text-slate-600 leading-relaxed">Nossa plataforma abriga apenas profissionais licenciados, altamente avaliados por outros pacientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (STEPS) */}
      <section id="como-funciona" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Três passos simples para o seu cuidado.</h2>
              <p className="text-slate-500 text-lg mb-10">Simplificamos o elo entre médicos qualificados e você. Esqueça processos burocráticos.</p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xl">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Busque sua especialidade</h4>
                    <p className="text-slate-600">Filtre pelos melhores especialistas adequados para o seu sintoma ou necessidade atual.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-xl">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Selecione o Horário Livre</h4>
                    <p className="text-slate-600">Acesse a agenda real do médico, sem conflitos. Encontre a brecha que bate com a sua rotina.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-lg shadow-emerald-600/10"><CheckCircle2 className="w-6 h-6" /></div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Pronto! Confirmação Imediata</h4>
                    <p className="text-slate-600">Você receberá um WhatsApp detalhado com as orientações para a consulta, além de um alerta na véspera.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Mock Dashboard UI decorativo */}
              <div className="bg-white rounded-3xl p-6 shadow-2xl shadow-slate-200/50 border border-slate-200">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400">RC</div>
                  <div>
                    <div className="h-4 w-32 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full bg-blue-50 border border-blue-100 p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <Calendar className="text-blue-500 w-5 h-5" />
                       <div className="h-4 w-24 bg-blue-200 rounded-full"></div>
                    </div>
                    <div className="h-6 w-16 bg-blue-600 rounded-full"></div>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                    <div className="flex items-center gap-3 opacity-60">
                       <Clock className="text-slate-400 w-5 h-5" />
                       <div className="h-4 w-24 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-8 -right-8 bg-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-blue-600/20 max-w-xs rotate-3 hidden md:block">
                <Star className="text-yellow-400 fill-yellow-400 w-6 h-6 mb-2" />
                <p className="font-medium text-sm">"Incrível! Nunca foi tão fluido marcar retorno com meu médico."</p>
                <p className="text-blue-200 text-xs mt-2">- Mariana B.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-24 bg-slate-900 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent hidden md:block"></div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Sua saúde não precisa esperar.</h2>
          <p className="text-slate-300 text-lg mb-10">Junte-se a milhares de pacientes priorizando o bem-estar com facilidade.</p>
          <Link href="/agendamento" className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 text-lg">
            Ver Médicos Disponíveis
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2 font-bold text-lg text-white mb-4">
           <Activity className="w-5 h-5 text-blue-500" /> MedFlow
        </div>
        <p>© {new Date().getFullYear()} MedFlow Inc. Todos os direitos reservados.</p>
      </footer>

      {/* CheckCircle2 is used but not imported correctly in the mockup above, adding it */}
      <div className="hidden"><CheckCircle2 /></div>
    </div>
  );
}

// Aux component injection to avoid import errors 
const CheckCircle2 = (props:any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>