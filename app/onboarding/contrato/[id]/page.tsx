"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { Loader2, ArrowRight, FileSignature, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function ContratoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const { data: dbData, error } = await supabase
        .from("doctor_onboarding")
        .select("nome, proposal, status")
        .eq("id", id)
        .single();
        
      if (error || !dbData) {
        alert("Dados não encontrados.");
        router.push("/onboarding/novo");
        return;
      }
      
      setData(dbData);
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  async function handlePayment() {
    setPaying(true);

    try {
      // Here you would integrate Stripe / Asaas
      // For now, we simulate the payment and status update
      const { error } = await supabase
        .from("doctor_onboarding")
        .update({
          status: "pagamento_parcial", // or pagamento_completo
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      alert("Pagamento processado com sucesso! A configuração da clínica foi iniciada.");
      // Redirect to final success page or dashboard
      router.push(`/admin`); // In real life, might go to a "Configurando seu sistema" screen
    } catch (error) {
      alert("Erro ao processar pagamento.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mb-6">
            <FileSignature className="w-8 h-8" />
          </div>
          <h1 className={`${playfair.className} text-4xl text-stone-900 mb-4`}>
            Contrato e Ativação
          </h1>
          <p className="text-stone-500 text-lg">
            Sua proposta foi aceita com sucesso. Para iniciar a configuração do seu sistema na ZyntraMed, realize o pagamento inicial.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 overflow-hidden relative p-8 md:p-10">
          
          <div className="mb-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
            <h3 className="font-semibold text-stone-900 mb-2">Resumo Financeiro</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-stone-600">Taxa de Setup (50% agora)</span>
              <span className="font-medium text-stone-900">R$ 750,00</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-600">Mensalidade (1º mês)</span>
              <span className="font-medium text-stone-900">R$ 697,00</span>
            </div>
            <div className="pt-4 border-t border-stone-200 flex justify-between items-center">
              <span className="font-semibold text-stone-900">Total a pagar hoje</span>
              <span className="text-2xl font-bold text-emerald-900">R$ 1.447,00</span>
            </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={paying}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {paying ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Simular Pagamento <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
          
        </div>

      </div>
    </div>
  );
}
