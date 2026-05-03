"use client";

import { useSearchParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { CheckCircle2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const playfair = Playfair_Display({ subsets: ["latin"] });

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return (
    <div className="bg-white p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100 max-w-lg text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-emerald-900"></div>
      
      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>

      <h1 className={`${playfair.className} text-3xl text-stone-900 mb-4`}>Cadastro Recebido!</h1>
      <p className="text-stone-500 mb-8 leading-relaxed">
        Acabamos de te enviar uma mensagem no <strong>WhatsApp</strong> com um link seguro. 
        <br/><br/>
        Precisamos que você responda um formulário rápido (menos de 2 minutos) para que possamos montar uma proposta totalmente personalizada para a sua clínica.
      </p>

      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-start gap-4 text-left mb-8">
        <MessageSquare className="w-6 h-6 text-stone-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-stone-600 font-medium mb-1">Não recebeu a mensagem?</p>
          <p className="text-xs text-stone-500">Verifique se o número inserido está correto ou <Link href={`/onboarding/formulario/${id}`} className="text-emerald-700 hover:underline font-medium">clique aqui para preencher o formulário manualmente</Link>.</p>
        </div>
      </div>
    </div>
  );
}

export default function SucessoPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-6">
      <Suspense fallback={<div>Carregando...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
