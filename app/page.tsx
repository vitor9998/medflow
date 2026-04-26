"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Clock, Star, ShieldCheck, Stethoscope, Menu, X, Users, MessageSquareShare, FileCheck2, BarChart3, Workflow, Users2, Sparkles, CheckCircle2, User } from "lucide-react";
import { MedsysLogo } from "@/components/Logo";
import { useState, useEffect } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Monitor scroll for fixed mobile CTA appearance & navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 selection:bg-emerald-200 overflow-x-hidden flex flex-col items-center" style={{ fontFamily: "'Geist', ui-sans-serif, system-ui, sans-serif" }}>
      
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 hover:opacity-80 transition-opacity">
             <MedsysLogo className="h-8 w-auto text-emerald-600 drop-shadow-sm" />
             Medsys
           </Link>
           <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
             <a href="#solucoes" className="hover:text-slate-900 transition-colors">Soluções</a>
             <a href="#como-funciona" className="hover:text-slate-900 transition-colors">Como Funciona</a>
             <Link href="/pricing" className="hover:text-slate-900 transition-colors">
               Preços
             </Link>
              <Link href="/paciente" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Sou Paciente
              </Link>
           </div>
           
           <div className="flex items-center gap-4">
             <Link href="/login" className="hidden md:flex text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
               Entrar
             </Link>
             <Link href="/signup" className="hidden md:flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-full transition-all shadow-md shadow-slate-900/10">
               Começar grátis <ArrowRight className="w-4 h-4" />
             </Link>
             <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-slate-900 p-1 bg-slate-100 rounded-md">
               {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
             </button>
           </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-white border-b border-slate-200 shadow-2xl flex flex-col p-6 gap-6 z-50">
             <a onClick={() => setMenuOpen(false)} href="#solucoes" className="text-slate-700 font-bold text-lg">Soluções</a>
             <a onClick={() => setMenuOpen(false)} href="#como-funciona" className="text-slate-700 font-bold text-lg">Como Funciona</a>
             <Link onClick={() => setMenuOpen(false)} href="/pricing" className="text-slate-700 font-bold text-lg">Preços</Link>
             <hr className="border-slate-100" />
             <Link onClick={() => setMenuOpen(false)} href="/login" className="text-slate-700 font-bold text-lg text-center bg-slate-50 py-3 rounded-xl border border-slate-200">Acessar Conta</Link>
             <Link onClick={() => setMenuOpen(false)} href="/signup" className="text-white font-bold text-lg bg-slate-900 py-3 rounded-xl text-center shadow-md">Criar conta grátis</Link>
             <Link onClick={() => setMenuOpen(false)} href="/paciente" className="text-emerald-600 font-bold text-lg text-center bg-emerald-50 py-3 rounded-xl border border-emerald-200">Sou Paciente</Link>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center relative">
        {/* Efeito Glow Fundo — Animated */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute top-32 left-1/3 w-[400px] h-[300px] bg-teal-400/5 blur-[100px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }}></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-bold mb-8 border border-emerald-200/60 shadow-sm hover:shadow-md transition-shadow cursor-default">
             <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
             O SaaS definitivo para Clínicas e Consultórios
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter text-slate-900 mb-6 max-w-4xl leading-[1.05]">
            Mais pacientes. <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">Menos tarefas.</span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 mb-10 max-w-2xl leading-relaxed font-medium">
            Sistema completo para médicos automatizarem consultas, organizarem atendimentos e aumentarem sua receita sem esforço.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4.5 rounded-full font-bold transition-all shadow-xl shadow-slate-900/20 text-lg hover:-translate-y-0.5 hover:shadow-2xl">
              Começar grátis <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/agendamento" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4.5 rounded-full font-bold transition-all text-lg shadow-sm hover:border-slate-300 hover:shadow-md">
              <Calendar className="w-5 h-5 text-emerald-600" /> Agendar consulta
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-sm text-slate-400 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Conforme LGPD</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500" /> +500 médicos ativos</span>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setup em 5 minutos</span>
          </div>
        </div>
      </section>

      {/* PATIENT CTA STRIP */}
      <section className="w-full max-w-4xl mx-auto px-6 -mt-6 mb-8 relative z-10">
        <Link href="/paciente" className="group flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0">
              <Calendar className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Já é paciente?</p>
              <p className="text-xs text-slate-500">Acesse suas consultas usando apenas seu telefone — sem senha.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </section>

      {/* DASHBOARD PREVIEW MOCKUP */}
      <section className="w-full max-w-6xl mx-auto px-6 pb-24 relative z-10">
         <div className="rounded-[2.5rem] bg-slate-900 p-2 sm:p-4 shadow-2xl shadow-emerald-900/20 md:-mt-10 overflow-hidden ring-1 ring-white/10 relative group/mockup hover:shadow-emerald-900/30 transition-shadow duration-700">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent group-hover/mockup:from-emerald-500/15 transition-all duration-700"></div>
            <div className="bg-[#0f172a] rounded-[2rem] border border-slate-800 flex flex-col overflow-hidden relative z-10 w-full aspect-video md:aspect-[21/9]">
               {/* Mock Header */}
               <div className="h-12 border-b border-slate-800 flex items-center px-6 gap-4 bg-slate-900/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="w-48 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center">
                      <span className="text-[10px] text-slate-500 font-mono">medsys.app/dashboard</span>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><User className="w-4 h-4 text-emerald-400"/></div>
               </div>
               {/* Mock Layout */}
               <div className="flex flex-1 overflow-hidden p-4 sm:p-6 gap-4 sm:gap-6">
                 <div className="w-44 hidden lg:flex flex-col gap-2 pt-2">
                   <div className="w-full h-8 bg-emerald-500/15 border border-emerald-500/20 rounded-lg flex items-center px-3 gap-2">
                     <div className="w-3 h-3 rounded bg-emerald-500/40"></div>
                     <div className="w-16 h-3 bg-emerald-500/20 rounded"></div>
                   </div>
                   <div className="w-full h-8 bg-slate-800/50 rounded-lg flex items-center px-3 gap-2">
                     <div className="w-3 h-3 rounded bg-slate-700"></div>
                     <div className="w-14 h-3 bg-slate-700/50 rounded"></div>
                   </div>
                   <div className="w-full h-8 bg-slate-800/50 rounded-lg flex items-center px-3 gap-2">
                     <div className="w-3 h-3 rounded bg-slate-700"></div>
                     <div className="w-12 h-3 bg-slate-700/50 rounded"></div>
                   </div>
                   <div className="w-full h-8 bg-slate-800/50 rounded-lg flex items-center px-3 gap-2">
                     <div className="w-3 h-3 rounded bg-slate-700"></div>
                     <div className="w-10 h-3 bg-slate-700/50 rounded"></div>
                   </div>
                 </div>
                 <div className="flex-1 flex flex-col gap-4 sm:gap-6">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                       <div className="h-20 sm:h-24 bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl sm:rounded-2xl flex flex-col p-3 sm:p-4 justify-between">
                         <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400"/></div>
                         <div className="flex flex-col gap-1">
                           <div className="w-10 sm:w-14 h-4 bg-slate-200/10 rounded font-mono text-[10px] text-emerald-400 flex items-center">24</div>
                           <div className="w-16 sm:w-20 h-3 bg-slate-700/50 rounded"></div>
                         </div>
                       </div>
                       <div className="h-20 sm:h-24 bg-slate-800/50 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                         <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700/50 flex items-center justify-center"><Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500"/></div>
                         <div className="flex flex-col gap-1">
                           <div className="w-10 sm:w-14 h-4 bg-slate-200/10 rounded font-mono text-[10px] text-slate-400 flex items-center">156</div>
                           <div className="w-16 sm:w-20 h-3 bg-slate-700/50 rounded"></div>
                         </div>
                       </div>
                       <div className="h-20 sm:h-24 bg-slate-800/50 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between">
                         <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700/50 flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500"/></div>
                         <div className="flex flex-col gap-1">
                           <div className="w-10 sm:w-14 h-4 bg-slate-200/10 rounded font-mono text-[10px] text-emerald-400 flex items-center">+12%</div>
                           <div className="w-16 sm:w-20 h-3 bg-slate-700/50 rounded"></div>
                         </div>
                       </div>
                    </div>
                    <div className="flex-1 bg-slate-800/30 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                      <div className="flex gap-4 h-full">
                        <div className="flex-1 flex items-end gap-1.5 pb-2">
                          {[35, 55, 40, 70, 50, 85, 65, 90, 75, 95, 80].map((h: number, i: number) => (
                            <div key={i} className="flex-1 rounded-t-sm transition-all" style={{ height: `${h}%`, background: h > 70 ? 'linear-gradient(to top, #059669, #10b981)' : '#1e293b' }}></div>
                          ))}
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* SEÇÃO: PARA MÉDICOS (PRINCIPAL) */}
      <section id="solucoes" className="py-24 bg-white border-y border-slate-200/50 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest uppercase text-emerald-600 mb-3">Plataforma All-in-One</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Tudo que o seu consultório precisa.</h3>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">Deixe as tarefas manuais para trás. O Medsys automatiza a sua rotina para que você foque no que importa: <span className="text-slate-900 font-bold">seus pacientes.</span></p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all text-left flex flex-col h-full group">
               <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <Calendar className="w-6 h-6 text-emerald-600" />
               </div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Agenda Inteligente</h4>
               <p className="text-slate-500 leading-relaxed font-medium">Os pacientes agendam sozinhos online. Os horários sincronizam automaticamente, evitando conflitos.</p>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all text-left flex flex-col h-full group">
               <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <MessageSquareShare className="w-6 h-6 text-emerald-600" />
               </div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Lembretes via App</h4>
               <p className="text-slate-500 leading-relaxed font-medium">Reduza as faltas em até 40% com confirmações enviadas direto no celular dos pacientes 24h antes.</p>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all text-left flex flex-col h-full group">
               <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <FileCheck2 className="w-6 h-6 text-emerald-600" />
               </div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Prontuário Simples</h4>
               <p className="text-slate-500 leading-relaxed font-medium">Anexos seguros e histórico em um clique. Organize laudos e o acompanhamento de todos os atendimentos.</p>
            </div>

            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-200 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-900/5 transition-all text-left flex flex-col h-full group">
               <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                 <Users2 className="w-6 h-6 text-emerald-600" />
               </div>
               <h4 className="text-xl font-bold text-slate-900 mb-3">Gestão de Pacientes</h4>
               <p className="text-slate-500 leading-relaxed font-medium">Capture pacientes pelo nosso portal B2C, tenha os contatos unificados e engaje sua base.</p>
            </div>

          </div>

          <div className="mt-16 text-center">
            <Link href="/signup" className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-full font-bold transition-all shadow-xl shadow-slate-900/20 text-lg">
              Começar a organizar meu consultório
            </Link>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA (SaaS Workflow) */}
      <section id="como-funciona" className="py-32 bg-slate-50 w-full relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="flex flex-col md:flex-row items-center gap-16 lg:gap-24">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">Um sistema autônomo com foco em <span className="text-emerald-600">escala.</span></h2>
              <p className="text-slate-500 text-lg mb-12 font-medium">Nós transformamos a forma como os pacientes chegam até você. Um loop infinito que poupa tempo e traz receita previsível.</p>
              
              <div className="space-y-10">
                <div className="flex gap-6 relative">
                  <div className="absolute top-12 left-[19px] w-[2px] h-[50px] bg-slate-200"></div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm shadow-inner ring-4 ring-slate-50 z-10">1</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Você configura sua agenda</h4>
                    <p className="text-slate-500 font-medium">Defina seus dias, horários livres e especialidades no Medsys em menos de 5 minutos.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 relative">
                  <div className="absolute top-12 left-[19px] w-[2px] h-[50px] bg-slate-200"></div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm shadow-inner ring-4 ring-slate-50 z-10">2</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Pacientes te encontram</h4>
                    <p className="text-slate-500 font-medium">Seu perfil público fica disponível. Os pacientes preenchem os sintomas e agendam sozinhos.</p>
                  </div>
                </div>
                
                <div className="flex gap-6 relative">
                  <div className="absolute top-12 left-[19px] w-[2px] h-[50px] bg-slate-200"></div>
                  <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-sm shadow-inner ring-4 ring-slate-50 z-10">3</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">O sistema te notifica</h4>
                    <p className="text-slate-500 font-medium">As consultas aparecem automaticamente no seu painel. Acompanhe a estimativa sem ligações.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm ring-4 ring-slate-50 z-10">
                     <CheckCircle2 className="w-5 h-5"/>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Automação assumindo</h4>
                    <p className="text-slate-500 font-medium">Nós enviamos lembretes, geramos as fichas dos pacientes e deixamos tudo pronto para o seu atendimento.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/2 flex justify-center">
               <div className="relative w-full max-w-md">
                 {/* Visual Cards Interacting */}
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 relative z-20">
                    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xl">D</div>
                      <div>
                         <p className="font-bold text-slate-900">Dr. Roberto Lima</p>
                         <p className="text-xs font-semibold text-emerald-600 uppercase">Cardiologia</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <Clock className="w-4 h-4 text-slate-400" />
                             <span className="font-bold text-slate-700 text-sm">Hoje, 14:30</span>
                          </div>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">Confirmado</span>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                          <div className="flex items-center gap-3">
                             <Clock className="w-4 h-4 text-slate-400" />
                             <span className="font-bold text-slate-700 text-sm">Hoje, 16:00</span>
                          </div>
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 font-bold text-xs rounded-full">Pendente</span>
                       </div>
                    </div>
                 </div>

                 <div className="absolute -bottom-10 -right-8 bg-slate-900 text-white p-5 rounded-2xl shadow-2xl border border-slate-700 z-30 w-64 animate-[bounce_4s_infinite]">
                    <div className="flex gap-3 items-center">
                       <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                       <div>
                         <p className="font-bold text-sm">Nova Consulta!</p>
                         <p className="text-slate-400 text-xs">Carlos M. marcou às 16:00</p>
                       </div>
                    </div>
                 </div>
               </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="py-24 bg-white border-y border-slate-200/50 w-full">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
               <div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Software feito para quem cuida de vidas.</h3>
                  <div className="flex gap-2 mb-6">
                     {[1,2,3,4,5].map((i: number) => <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xl text-slate-600 font-medium italic mb-8 leading-relaxed">
                     "Depois que integramos o Medsys no consultório, não precisamos mais de três atendentes faturando guias e marcando papel. Os pacientes marcam de madrugada e a gente só abre a tela para ver quem será atendido."
                  </p>
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">M</div>
                     <div>
                        <p className="font-bold text-slate-900">Dr. Marcos Silveira</p>
                        <p className="text-sm font-medium text-slate-500">Endocrinologista, Clínica Vitae</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center">
                     <p className="text-5xl font-extrabold text-emerald-600 mb-2">55%</p>
                     <p className="font-bold text-slate-700">menos faltas</p>
                     <p className="text-xs text-slate-500 mt-2">com automações.</p>
                  </div>
                  <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 text-center">
                     <p className="text-5xl font-extrabold text-emerald-600 mb-2">3h</p>
                     <p className="font-bold text-slate-700">poupadas/dia</p>
                     <p className="text-xs text-slate-500 mt-2">em tarefas manuais.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* SEÇÃO PACIENTE (SECUNDÁRIA) */}
      <section className="py-24 bg-slate-50 w-full relative">
         <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
               <Stethoscope className="w-8 h-8 text-slate-900" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Você é paciente?</h2>
            <p className="text-slate-500 text-xl font-medium mb-10">
               Agende sua consulta sem ligações com os melhores médicos da nossa rede credenciada.
            </p>
            <Link href="/agendamento" className="inline-flex items-center gap-2 bg-white hover:bg-emerald-50 text-slate-900 border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-8 py-4 rounded-full font-bold transition-all text-lg shadow-sm">
               Agendar consulta agora
            </Link>
         </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-24 bg-slate-900 w-full text-white overflow-hidden relative">
         {/* Design elements */}
         <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
               <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">O que nos torna <br className="hidden lg:block"/>diferentes.</h2>
               <p className="text-slate-400 text-lg mb-10 max-w-lg font-medium">Buscamos simplificar radicalmente a tecnologia da saúde. Sem softwares travados de convênio dos anos 90.</p>

               <ul className="space-y-6">
                  <li className="flex gap-4">
                     <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                     <div>
                        <p className="font-bold text-lg mb-1">Segurança de ponta</p>
                        <p className="text-slate-400 font-medium">Arquivos criptografados em cofre privado respeitando a LGPD e normas globais de saúde.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <Sparkles className="w-6 h-6 text-emerald-400 shrink-0" />
                     <div>
                        <p className="font-bold text-lg mb-1">Modernidade real</p>
                        <p className="text-slate-400 font-medium">Design focado em velocidade. Feito para você usar 100% pelo mobile se desejar.</p>
                     </div>
                  </li>
                  <li className="flex gap-4">
                     <Workflow className="w-6 h-6 text-emerald-400 shrink-0" />
                     <div>
                        <p className="font-bold text-lg mb-1">100% Integrado</p>
                        <p className="text-slate-400 font-medium">Ficha de paciente, agendamento e exames, tudo unificado num único painel de controle.</p>
                     </div>
                  </li>
               </ul>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl relative">
               {/* Decorative Abstract Graph */}
               <div className="flex items-end gap-3 h-48 opacity-50 mb-6">
                  <div className="w-full bg-slate-700 rounded-t-lg h-[20%]"></div>
                  <div className="w-full bg-slate-700 rounded-t-lg h-[45%]"></div>
                  <div className="w-full bg-slate-700 rounded-t-lg h-[30%]"></div>
                  <div className="w-full bg-emerald-500 rounded-t-lg h-[80%] relative shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                     <div className="absolute -top-10 -left-6 bg-slate-900 border border-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold font-mono">+12.4k</div>
                  </div>
                  <div className="w-full bg-emerald-500 rounded-t-lg h-[95%]"></div>
               </div>
               <p className="font-bold text-xl mb-2 text-white">Prontos para crescimento forte</p>
               <p className="text-slate-400 font-medium text-sm">Plataforma elástica que escala com as franquias da sua clínica.</p>
            </div>
         </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 md:py-32 bg-emerald-600 text-center relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">Pronto para transformar <br/>seu consultório?</h2>
          <p className="text-emerald-100 text-xl mb-10 max-w-2xl font-medium">Junte-se à centenas de médicos inovadores. Configure tudo rapidamente e comece a ver os resultados hoje mesmo.</p>
          <Link href="/signup" className="inline-flex w-full sm:w-auto items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-10 py-5 rounded-full font-bold transition-all shadow-2xl shadow-slate-900/30 text-lg hover:-translate-y-1">
            Começar grátis agora <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-emerald-200 font-medium">Setup grátis • Cancelamento a qualquer momento</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 pt-16 pb-8 px-6 border-t border-slate-900 text-center md:text-left text-slate-500 text-sm w-full font-medium">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl tracking-tight text-white mb-4">
              <MedsysLogo className="h-7 w-auto text-emerald-500" /> Medsys
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-xs mx-auto md:mx-0">A plataforma predileta de inovação em gestão para saúde.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Produto</h4>
            <ul className="space-y-3">
               <li><a href="#solucoes" className="hover:text-white transition-colors">Soluções</a></li>
               <li><a href="#como-funciona" className="hover:text-white transition-colors">Como funciona</a></li>
               <li><Link href="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Pacientes</h4>
            <ul className="space-y-3">
               <li><Link href="/agendamento" className="hover:text-white transition-colors">Agendar Consulta</Link></li>
               <li><Link href="/paciente" className="hover:text-white transition-colors">Meus Agendamentos</Link></li>
               <li><a href="#" className="hover:text-white transition-colors">Suporte</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
               <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
               <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Medsys. Todos os direitos reservados.</p>
          <div className="flex gap-4 opacity-50">
             {/* Social placeholders */}
             <div className="w-8 h-8 rounded-full bg-slate-800"></div>
             <div className="w-8 h-8 rounded-full bg-slate-800"></div>
          </div>
        </div>
      </footer>

      {/* Sticky Mobile CTA for Doctors */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
         <div className={`transition-all duration-500 flex justify-center ${scrolled ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'}`}>
            <Link href="/signup" className="pointer-events-auto w-full max-w-[300px] flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-full font-bold shadow-2xl shadow-slate-900/40 ring-2 ring-white/20 active:scale-95 transition-all text-base">
              Começar grátis <ArrowRight className="w-4 h-4" />
            </Link>
         </div>
      </div>
    </div>
  );
}