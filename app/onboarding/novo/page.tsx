"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { ArrowRight, Loader2, HeartPulse } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function NovoCadastro() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: "",
    clinic_name: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao registrar");

      const data = await res.json();
      
      // Redirect to a success page or the form directly for demonstration
      // In a real scenario, they check their WhatsApp, but we can also just show a success message
      router.push(`/onboarding/sucesso?id=${data.id}`);
      
    } catch (error) {
      alert("Houve um erro ao processar seu cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] flex">
      {/* Left side: Branding */}
      <div className="hidden lg:flex w-1/2 bg-emerald-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-16">
             <HeartPulse className="w-8 h-8 text-emerald-300" />
             <span className={`${playfair.className} text-2xl font-semibold tracking-wide`}>ZyntraMed</span>
          </div>
          <h1 className={`${playfair.className} text-5xl lg:text-6xl text-white font-light leading-tight mb-6`}>
            A inteligência <br />que a sua clínica <span className="italic text-emerald-300">merece.</span>
          </h1>
          <p className="text-emerald-100/80 text-lg max-w-md leading-relaxed">
            Gestão humanizada, agendamentos automáticos e prateleiras de serviços que valorizam o seu tempo e o do seu paciente.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <h2 className={`${playfair.className} text-3xl text-stone-900 mb-2`}>Crie sua conta</h2>
          <p className="text-stone-500 mb-8">Dê o primeiro passo para modernizar o seu consultório.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Nome Completo</label>
              <input 
                type="text" 
                required 
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800" 
                placeholder="Dr(a). Carlos Silva" 
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Email</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800" 
                placeholder="medico@clinica.com" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">WhatsApp</label>
              <input 
                type="tel" 
                required 
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: e.target.value})}
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800" 
                placeholder="5511999999999" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Nome da Clínica / Consultório</label>
              <input 
                type="text" 
                required 
                value={formData.clinic_name}
                onChange={e => setFormData({...formData, clinic_name: e.target.value})}
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all text-stone-800" 
                placeholder="Clínica Silva" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-6 group disabled:opacity-70"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
              ) : (
                <>Começar agora <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
