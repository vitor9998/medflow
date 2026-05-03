"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { Loader2, CheckCircle2, ShieldCheck, ArrowRight, FileText } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function ProposalPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const { data: dbData, error } = await supabase
        .from("doctor_onboarding")
        .select("nome, proposal, status")
        .eq("id", id)
        .single();
        
      if (error || !dbData) {
        alert("Proposta não encontrada.");
        router.push("/onboarding/novo");
        return;
      }
      
      setData(dbData);
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  async function handleAccept() {
    setAccepting(true);

    try {
      const { error } = await supabase
        .from("doctor_onboarding")
        .update({
          status: "proposta_aceita",
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      // TODO: API call to trigger contract generation / WhatsApp message
      // redirect to next step (contract or payment instructions)
      router.push(`/onboarding/contrato/${id}`);
    } catch (error) {
      alert("Erro ao aceitar proposta. Tente novamente.");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-900 animate-spin" />
      </div>
    );
  }

  const { proposal, nome } = data;

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-6">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className={`${playfair.className} text-4xl text-stone-900 mb-4`}>
            Proposta Personalizada
          </h1>
          <p className="text-stone-500 text-lg">
            Dr(a). <span className="font-semibold text-stone-800">{nome.split(' ')[0]}</span>, analisamos as necessidades da sua clínica e estruturamos o pacote ideal para você.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-900"></div>
          
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-8 border-b border-stone-100 gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-2">Recomendação</p>
                <h2 className={`${playfair.className} text-3xl text-stone-900`}>{proposal?.planName}</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-stone-500 mb-1">Investimento Mensal</p>
                <p className="text-3xl font-bold text-stone-900">{proposal?.price}</p>
                <p className="text-xs text-stone-400 mt-1">Taxa de Setup Única: {proposal?.setupFee}</p>
              </div>
            </div>

            <div className="mb-10">
              <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                O que está incluído no seu plano:
              </h3>
              <ul className="space-y-4">
                {proposal?.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-stone-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl mb-8">
              <h4 className="font-medium text-stone-900 mb-2">Próximos passos</h4>
              <p className="text-sm text-stone-600 leading-relaxed">
                Ao aceitar esta proposta, geraremos automaticamente o seu contrato de prestação de serviços. A liberação do sistema ocorrerá após a assinatura e pagamento da primeira parcela (50%).
              </p>
            </div>

            <button 
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {accepting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processando Aceite...</>
              ) : (
                <>Aceitar Proposta e Gerar Contrato <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            <p className="text-center text-xs text-stone-400 mt-4 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Aceite com validade legal e proteção de dados
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
