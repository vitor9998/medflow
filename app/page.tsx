"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Star, ShieldCheck, Stethoscope } from "lucide-react";
import { MedsysLogo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200 overflow-x-hidden flex flex-col items-center">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
             <MedsysLogo className="h-8 w-auto drop-shadow-sm" />
             Medsys
           </Link>
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
             <a href="#beneficios" className="hover:text-emerald-600 transition-colors">Benefícios</a>
             <a href="#como-funciona" className="hover:text-emerald-600 transition-colors">Como Funciona</a>
             <Link href="/pricing" className="hover:text-emerald-600 transition-colors">
               Planos
             </Link>
             <Link href="/para-medicos" className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
               Para Clínicas
             </Link>
           </div>
           <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
             Acessar Conta
           </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8 border border-emerald-100">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           A revolução do agendamento clínico
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl leading-tight">
          Agende a sua consulta sem <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">complicações</span>.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Encontre o especialista ideal e garanta seu horário no <span className="font-semibold">Medsys</span> de forma totalmente segura e digital, sem filas de espera na recepção.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/agendamento" className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 text-base sm:text-lg hover:-translate-y-0.5">
            Agendar Consulta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a href="#como-funciona" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold transition-all text-base sm:text-lg hover:-translate-y-0.5">
            Saber mais
          </a>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="py-24 bg-white border-y border-slate-200/50 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que escolher o Medsys?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">Tudo foi desenhado para colocar a sua saúde em primeiro lugar com conectividade rápida.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-900/5 transition-all text-left">
               <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-600 transition-colors">
                 <Clock className="w-6 h-6 text-emerald-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Agilidade Total</h3>
               <p className="text-slate-600 leading-relaxed">Não perca horas no telefone da clínica. Valide o horário perfeito pra você num passe de mágica a partir do seu celular.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-teal-900/5 transition-all text-left">
               <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-6 group-hover:bg-teal-600 transition-colors">
                 <ShieldCheck className="w-6 h-6 text-teal-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Segurança Nativa</h3>
               <p className="text-slate-600 leading-relaxed">Todos os arquivos dos pacientes e exames são devidamente criptografados respeitando as normativas globais.</p>
            </div>

            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100/50 relative overflow-hidden group hover:shadow-xl hover:shadow-cyan-900/5 transition-all text-left">
               <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 group-hover:bg-cyan-600 transition-colors">
                 <Stethoscope className="w-6 h-6 text-cyan-600 group-hover:text-white" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-3">Time Especializado</h3>
               <p className="text-slate-600 leading-relaxed">A rede credenciada do Medsys abriga exclusivamente profissionais certificados e muito bem avaliados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (STEPS) */}
      <section id="como-funciona" className="py-24 bg-slate-50 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Poucos passos entre você e o especialista.</h2>
              <p className="text-slate-500 text-lg mb-10 max-w-xl">Chega daquela espera incalculável. Nós encurtamos a distância usando a nossa infraestrutura fluida.</p>
              
              <div className="space-y-8">
                <div className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner border border-emerald-200">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Qual é a queixa?</h4>
                    <p className="text-slate-600 leading-relaxed">Acesse a aba clínica e filtre pelo tipo de área da qual o corpo exige atenção no instante.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-xl shadow-inner border border-emerald-200">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Analise a Agenda Oficial</h4>
                    <p className="text-slate-600 leading-relaxed">Observe as brechas de compromissos abertos na planilha dos doutores e selecione com apenas um touch.</p>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-teal-100 text-teal-600 font-bold flex items-center justify-center text-xl shadow-inner border border-teal-200 text-center leading-none">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Alarme de Retorno</h4>
                    <p className="text-slate-600 leading-relaxed">O médico aprova o agendamento no ato e horas antes você será notificado digitalmente sem faltas!</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mock Dashboard Decorativo */}
            <div className="relative w-full max-w-md mx-auto lg:max-w-none pt-10">
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-slate-200/50 border border-slate-200/80 w-full">
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 mb-6 border-b border-slate-100 pb-5">
                  <MedsysLogo className="w-10 h-10 drop-shadow" />
                  <div>
                    <div className="h-4 w-32 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full bg-emerald-50 border border-emerald-100 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                       <Calendar className="text-emerald-500 w-5 h-5 shrink-0" />
                       <div className="h-4 w-32 bg-emerald-200/80 rounded-full"></div>
                    </div>
                    <div className="h-8 w-20 bg-emerald-600 rounded-full shrink-0"></div>
                  </div>
                  <div className="w-full bg-slate-50 border border-slate-100 p-4 sm:p-5 rounded-2xl overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 opacity-60">
                       <Clock className="text-slate-400 w-5 h-5 shrink-0" />
                       <div className="h-4 w-28 bg-slate-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-2 bg-emerald-600 text-white p-5 sm:p-6 rounded-2xl shadow-xl shadow-emerald-500/30 max-w-[260px] sm:max-w-xs rotate-3 border border-emerald-500 hidden xl:block">
                <Star className="text-yellow-400 fill-yellow-400 w-5 h-5 mb-2" />
                <p className="font-medium text-[13px] sm:text-sm">"Eu vivia esquecendo o horário das consultas até utilizar essa maravilha online."</p>
                <p className="text-emerald-100 text-xs mt-3">- Ricardo Gonçalves.</p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-28 bg-slate-900 border-t border-slate-800 text-center relative w-full overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Sua saúde passa antes pela Medsys.</h2>
          <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">Junte-se à milhares de lares e dezenas de clínicas que escolheram priorizar a pontualidade e a conveniência.</p>
          <Link href="/agendamento" className="inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-10 py-5 rounded-2xl font-extrabold transition-all shadow-xl shadow-emerald-500/20 text-lg hover:scale-105">
            Explorar Agendamentos Liberados
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 py-12 px-6 border-t border-slate-800 text-center text-slate-500 text-sm w-full">
        <div className="flex items-center justify-center gap-2 font-bold text-lg text-white mb-4">
           <MedsysLogo className="h-6 w-auto opacity-80" /> Medsys
        </div>
        <p>© {new Date().getFullYear()} Medsys Solutions. A plataforma de inovação médica. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}