"use client";

import Link from "next/link";
import { ArrowRight, Calendar, Sparkles, CheckCircle2, User, ChevronRight, Play, ShieldCheck, MapPin, Clock } from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";
import { useState, useEffect } from "react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function HomeEditorial() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50 overflow-x-hidden flex flex-col items-center`}>
      
      {/* MINIMALIST NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
           <Link href="/" className="flex items-center gap-3 font-semibold tracking-tight text-emerald-900 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto text-emerald-900" />
           </Link>
           <div className="hidden md:flex items-center gap-10 text-xs tracking-widest uppercase font-semibold text-stone-500">
             <a href="#solucoes" className="hover:text-emerald-900 transition-colors">Soluções</a>
             <a href="#como-funciona" className="hover:text-emerald-900 transition-colors">Abordagem</a>
             <Link href="/pricing" className="hover:text-emerald-900 transition-colors">
               Investimento
             </Link>
           </div>
           
           <div className="flex items-center gap-6">
             <Link href="/paciente" className="hidden md:flex text-xs tracking-widest uppercase font-semibold text-stone-500 hover:text-emerald-900 transition-colors items-center gap-2">
               Sou Paciente
             </Link>
             <div className="h-4 w-px bg-stone-200 hidden md:block"></div>
             <Link href="/login" className="hidden md:flex text-xs tracking-widest uppercase font-semibold text-stone-500 hover:text-emerald-900 transition-colors">
               Acesso
             </Link>
             <Link href="/signup" className="text-xs tracking-widest uppercase font-semibold text-white bg-emerald-900 hover:bg-emerald-800 px-6 py-3 rounded-full transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
               Iniciar
             </Link>
           </div>
        </div>
      </nav>

      {/* EDITORIAL HERO */}
      <section className="pt-40 pb-20 md:pt-48 md:pb-32 px-6 w-full max-w-7xl mx-auto flex flex-col items-center text-center relative">
        <div className="absolute top-0 right-0 w-1/2 h-[600px] bg-[#F4F1EA] -z-10 rounded-bl-[200px] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/5 text-emerald-900 text-xs font-semibold tracking-widest uppercase mb-8 border border-emerald-900/10">
             Sistema de Gestão Médica
          </div>
          
          <h1 className={`${playfair.className} text-6xl md:text-7xl lg:text-8xl font-semibold text-stone-900 mb-8 max-w-4xl leading-[1.05] tracking-tight`}>
            A nova <span className="italic text-emerald-900">assinatura</span> da saúde de excelência.
          </h1>
          
          <p className="text-xl md:text-2xl text-stone-500 mb-12 max-w-2xl leading-relaxed font-light">
            Automatize o agendamento e a gestão do seu consultório com uma elegância que seus pacientes irão admirar.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-5 rounded-full font-medium tracking-wide transition-all shadow-xl text-lg hover:-translate-y-1 group">
              Transforme sua clínica <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/agendamento" className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#FDFCF8] hover:bg-stone-50 text-stone-800 border border-stone-200 px-10 py-5 rounded-full font-medium transition-all text-lg hover:border-stone-300">
              Ver perfil dos especialistas
            </Link>
          </div>
        </div>
      </section>

      {/* EDITORIAL FEATURES GRID */}
      <section id="solucoes" className="py-32 bg-emerald-900 text-stone-50 w-full">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            <div className="lg:col-span-5">
              <h2 className={`${playfair.className} text-4xl lg:text-5xl font-light mb-8 leading-tight`}>
                Design <span className="italic text-emerald-300">Intencional</span> para Rotinas Complexas.
              </h2>
              <p className="text-emerald-100/80 text-lg leading-relaxed font-light mb-10">
                Criamos um ambiente onde a tecnologia recua e o cuidado avança. Sem interfaces poluídas. Apenas o essencial para você e sua equipe.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-lg mb-1">Agenda Autônoma</p>
                    <p className="text-emerald-100/60 font-light text-sm">Pacientes marcam via portal 24/7. O sistema evita conflitos e otimiza o seu tempo.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-lg mb-1">Concierge via WhatsApp</p>
                    <p className="text-emerald-100/60 font-light text-sm">Nossa IA confirma horários e avisa sobre reagendamentos automaticamente.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-emerald-800/20 border border-emerald-800/50 p-10 rounded-2xl backdrop-blur-sm flex flex-col justify-between h-full">
                <Calendar className="w-8 h-8 text-emerald-300 mb-12 stroke-[1.5px]" />
                <div>
                  <h4 className={`${playfair.className} text-2xl mb-3`}>Agendamento Premium</h4>
                  <p className="text-emerald-100/70 text-sm leading-relaxed font-light">Uma experiência de marcação de consultas que reflete o prestígio do seu nome.</p>
                </div>
              </div>
              <div className="bg-emerald-800/20 border border-emerald-800/50 p-10 rounded-2xl backdrop-blur-sm flex flex-col justify-between h-full sm:translate-y-12">
                <ShieldCheck className="w-8 h-8 text-emerald-300 mb-12 stroke-[1.5px]" />
                <div>
                  <h4 className={`${playfair.className} text-2xl mb-3`}>Prontuário Elegante</h4>
                  <p className="text-emerald-100/70 text-sm leading-relaxed font-light">Histórico do paciente acessível instantaneamente em uma interface minimalista.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* EDITORIAL WORKFLOW */}
      <section id="como-funciona" className="py-32 bg-[#F4F1EA] w-full">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-xs uppercase tracking-widest text-emerald-900 font-bold mb-4">A Experiência</h2>
          <h3 className={`${playfair.className} text-4xl md:text-5xl text-stone-900 mb-20`}>Como o ZyntraMed Eleva a Sua Prática</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative text-left">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-stone-300/50"></div>
            
            <div className="relative">
              <div className={`${playfair.className} text-5xl italic text-stone-300 mb-6 bg-[#F4F1EA] inline-block pr-6 relative z-10`}>01.</div>
              <h4 className="text-xl font-semibold text-stone-900 mb-3">O Perfil Pessoal</h4>
              <p className="text-stone-500 font-light leading-relaxed">Você recebe uma página editorial exclusiva, otimizada para capturar e converter pacientes que buscam alto padrão.</p>
            </div>
            
            <div className="relative">
              <div className={`${playfair.className} text-5xl italic text-stone-300 mb-6 bg-[#F4F1EA] inline-block pr-6 relative z-10`}>02.</div>
              <h4 className="text-xl font-semibold text-stone-900 mb-3">O Filtro Invisível</h4>
              <p className="text-stone-500 font-light leading-relaxed">O sistema gerencia os horários, envia cobranças e prepara o dossiê do paciente sem a intervenção da sua equipe.</p>
            </div>
            
            <div className="relative">
              <div className={`${playfair.className} text-5xl italic text-emerald-900/40 mb-6 bg-[#F4F1EA] inline-block pr-6 relative z-10`}>03.</div>
              <h4 className="text-xl font-semibold text-stone-900 mb-3">A Recepção Perfeita</h4>
              <p className="text-stone-500 font-light leading-relaxed">O paciente chega confirmado. Você tem todas as informações organizadas. O foco retorna para a relação médica.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-32 bg-[#FDFCF8] text-center w-full">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className={`${playfair.className} text-5xl md:text-6xl text-stone-900 mb-8 leading-tight`}>Pronto para o próximo nível?</h2>
          <p className="text-stone-500 text-xl font-light mb-12">Integre o ZyntraMed ao seu consultório e experimente o padrão ouro em gestão de saúde.</p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-3 bg-emerald-900 hover:bg-emerald-800 text-white px-10 py-5 rounded-full font-medium tracking-wide transition-all shadow-xl text-lg hover:-translate-y-1 group">
            Iniciar setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* EDITORIAL FOOTER */}
      <footer className="bg-stone-900 pt-20 pb-10 px-6 text-stone-400 w-full">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 tracking-tight text-white mb-6">
              <ZyntraLogo className="h-6 w-auto text-emerald-500" />
            </Link>
            <p className="text-stone-500 text-sm font-light leading-relaxed max-w-xs">A assinatura da saúde de excelência. Gestão clínica redefinida através do design.</p>
          </div>
          <div>
            <h4 className="text-stone-300 text-xs uppercase tracking-widest font-semibold mb-6">Plataforma</h4>
            <ul className="space-y-4 text-sm font-light">
               <li><a href="#solucoes" className="hover:text-white transition-colors">A Abordagem</a></li>
               <li><a href="#como-funciona" className="hover:text-white transition-colors">Jornada do Paciente</a></li>
               <li><Link href="/pricing" className="hover:text-white transition-colors">Investimento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-300 text-xs uppercase tracking-widest font-semibold mb-6">Rede</h4>
            <ul className="space-y-4 text-sm font-light">
               <li><Link href="/agendamento" className="hover:text-white transition-colors">Encontrar Especialista</Link></li>
               <li><Link href="/paciente" className="hover:text-white transition-colors">Acesso do Paciente</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-300 text-xs uppercase tracking-widest font-semibold mb-6">Contato</h4>
            <ul className="space-y-4 text-sm font-light">
               <li><a href="#" className="hover:text-white transition-colors">Suporte Exclusivo</a></li>
               <li><a href="#" className="hover:text-white transition-colors">Termos e Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-stone-800 pt-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-light">
          <p>© {new Date().getFullYear()} ZyntraMed. Todos os direitos reservados.</p>
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> São Paulo, SP</span>
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> Seg - Sex, 08h às 18h</span>
          </div>
        </div>
      </footer>

    </div>
  );
}