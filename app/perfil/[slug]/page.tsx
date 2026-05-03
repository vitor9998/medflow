"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  ArrowRight, 
  Loader2, 
  Calendar, 
  ShieldCheck,
  Award,
  ChevronLeft,
  Clock,
  MapPin,
  Stethoscope,
  Sparkles
} from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"] });

export default function PerfilMedicoEditorial() {
  const params = useParams();
  const router = useRouter();
  const [medico, setMedico] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMedico() {
      if (!params.slug) return;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (error || !data) {
        console.log("Erro ao buscar médico:", error);
        router.push("/agendamento");
        return;
      }

      setMedico(data);
      setLoading(false);
    }

    loadMedico();
  }, [params.slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex flex-col items-center justify-center text-emerald-900">
        <Loader2 className="w-10 h-10 animate-spin mb-6 stroke-[1.5px]" />
        <p className={`${inter.className} text-stone-500 tracking-widest uppercase text-xs font-semibold`}>
          Acessando Perfil
        </p>
      </div>
    );
  }

  if (!medico) return null;

  const nomeFormatado = medico.nome?.startsWith('Dr') ? medico.nome : `Dr. ${medico.nome}`;
  const especialidade = medico.especialidade || "Especialista em Saúde Integrada";

  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50`}>
      
      {/* MINIMALIST HEADER */}
      <header className="fixed top-0 w-full z-50 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 text-stone-900 px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/agendamento" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto" /> 
           </Link>
           <Link href="/agendamento" className="text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:text-emerald-900 transition-colors">
              <ChevronLeft className="w-4 h-4" /> Voltar
           </Link>
        </div>
      </header>

      <main className="relative">
        
        {/* EDITORIAL HERO */}
        <section className="relative w-full pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-2/3 h-full bg-[#F4F1EA] -z-10 rounded-bl-[120px] opacity-70"></div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left: Typography & Intro */}
            <div className="lg:col-span-7 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                {medico.foto_url && (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0 bg-stone-100">
                    <img src={medico.foto_url} alt={`Foto de ${nomeFormatado}`} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-900/10 bg-emerald-900/5 text-emerald-900 text-xs font-semibold tracking-widest uppercase w-fit">
                   <ShieldCheck className="w-3.5 h-3.5" />
                   CRM Verificado
                </div>
              </div>
              
              <h1 className={`${playfair.className} text-6xl md:text-7xl lg:text-8xl font-semibold text-stone-900 leading-[1.05] tracking-tight mb-8`}>
                {nomeFormatado}
              </h1>
              
              <p className="text-xl md:text-2xl text-stone-500 font-light max-w-xl leading-relaxed mb-12">
                {medico.descricao_perfil || <><span className="italic text-emerald-900">Uma abordagem exclusiva e humanizada</span> para a sua saúde, combinando anos de excelência médica com cuidado genuíno.</>}
              </p>

              {/* Stats/Badges */}
              <div className="flex flex-wrap gap-8 border-y border-stone-200/60 py-8">
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">Especialidade</p>
                  <p className={`${playfair.className} text-xl text-stone-800`}>{especialidade}</p>
                </div>
                <div className="w-px bg-stone-200/60 hidden sm:block"></div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">Experiência</p>
                  <p className={`${playfair.className} text-xl text-stone-800`}>+10 Anos</p>
                </div>
                <div className="w-px bg-stone-200/60 hidden sm:block"></div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">Avaliação</p>
                  <p className={`${playfair.className} text-xl text-stone-800 flex items-center gap-2`}>
                    4.9 <Sparkles className="w-4 h-4 text-emerald-700" />
                  </p>
                </div>
                <div className="w-px bg-stone-200/60 hidden sm:block"></div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-1">Contato</p>
                  <p className={`${playfair.className} text-xl text-stone-800 flex items-center gap-2`}>
                    {medico.telefone || "(11) 99999-9999"}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Right: Floating Booking Form */}
            <div className="lg:col-span-5 relative mt-8 lg:mt-0 lg:-mt-12 z-20">
              <div className="bg-white p-8 md:p-10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 relative">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-900 rounded-t-2xl"></div>
                
                <h3 className={`${playfair.className} text-3xl text-stone-900 mb-2`}>Reservar Horário</h3>
                <p className="text-stone-500 text-sm mb-8">Agendamento integrado diretamente à agenda do especialista.</p>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); router.push(`/agendamento/${medico.slug}`); }}>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Nome Completo</label>
                    <input type="text" required className="w-full px-4 py-3.5 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800 placeholder-stone-300" placeholder="Como prefere ser chamado?" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Contato</label>
                    <input type="tel" required className="w-full px-4 py-3.5 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800 placeholder-stone-300" placeholder="(00) 00000-0000" />
                  </div>
                  
                  <button type="submit" className="w-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-4 group">
                    Continuar para a Agenda
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Ambiente Seguro e Criptografado
                  </p>
                </form>
              </div>
            </div>

          </div>
        </section>

        {/* EDITORIAL ABOUT & PHILOSOPHY */}
        <section className="py-24 bg-emerald-900 text-stone-50 relative overflow-hidden">
          {/* Subtle noise texture or pattern could go here */}
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-32 items-center">
            <div>
              <h2 className={`${playfair.className} text-4xl lg:text-5xl font-light mb-8 leading-tight`}>
                A Filosofia de <br/><span className="italic text-emerald-300">Cuidado e Atenção</span>
              </h2>
              <p className="text-emerald-100/80 text-lg leading-relaxed font-light mb-6 whitespace-pre-wrap">
                {medico.filosofia || "Acredito que a medicina verdadeira vai além do diagnóstico. É sobre entender o paciente em sua totalidade, respeitando sua história e buscando soluções que promovam longevidade e qualidade de vida."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="border border-emerald-800/50 bg-emerald-800/20 p-8 rounded-2xl backdrop-blur-sm">
                <Award className="w-8 h-8 text-emerald-300 mb-6 stroke-[1.5px]" />
                <h4 className={`${playfair.className} text-2xl mb-3`}>Excelência</h4>
                <p className="text-emerald-100/70 text-sm leading-relaxed">Formação nas melhores instituições e atualização contínua.</p>
              </div>
              <div className="border border-emerald-800/50 bg-emerald-800/20 p-8 rounded-2xl backdrop-blur-sm sm:translate-y-8">
                <Stethoscope className="w-8 h-8 text-emerald-300 mb-6 stroke-[1.5px]" />
                <h4 className={`${playfair.className} text-2xl mb-3`}>Precisão</h4>
                <p className="text-emerald-100/70 text-sm leading-relaxed">Diagnósticos assertivos baseados em evidências científicas sólidas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ELEGANT PROCESS STEPS */}
        <section className="py-32 bg-[#FDFCF8]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-xs uppercase tracking-widest text-emerald-900 font-bold mb-4">A Jornada do Paciente</h2>
            <h3 className={`${playfair.className} text-4xl md:text-5xl text-stone-900 mb-20`}>Agendamento Simplificado</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative">
              {/* Connecting line */}
              <div className="hidden sm:block absolute top-12 left-[16%] right-[16%] h-px bg-stone-200"></div>
              
              <div className="relative flex flex-col items-center">
                <div className="w-24 h-24 bg-white border border-stone-200 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <span className={`${playfair.className} text-3xl italic text-stone-300`}>1</span>
                </div>
                <h4 className="text-lg font-semibold text-stone-900 mb-2">Solicitação</h4>
                <p className="text-sm text-stone-500 max-w-[200px]">Preencha seus dados básicos e escolha o horário ideal na agenda.</p>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="w-24 h-24 bg-white border border-stone-200 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-sm">
                  <span className={`${playfair.className} text-3xl italic text-stone-300`}>2</span>
                </div>
                <h4 className="text-lg font-semibold text-stone-900 mb-2">Confirmação</h4>
                <p className="text-sm text-stone-500 max-w-[200px]">Receba a confirmação instantânea via WhatsApp integrado.</p>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="w-24 h-24 bg-emerald-900 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-lg shadow-emerald-900/20">
                  <span className={`${playfair.className} text-3xl italic text-emerald-100`}>3</span>
                </div>
                <h4 className="text-lg font-semibold text-stone-900 mb-2">Atendimento</h4>
                <p className="text-sm text-stone-500 max-w-[200px]">Compareça à clínica e receba um atendimento de excelência.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* MINIMAL FOOTER */}
      <footer className="bg-stone-900 py-12 border-t border-stone-800 text-stone-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <ZyntraLogo className="h-8 w-auto text-stone-500" /> 
          <div className="flex items-center gap-8 text-sm">
            <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> São Paulo, SP</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Seg - Sex, 08h às 18h</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
