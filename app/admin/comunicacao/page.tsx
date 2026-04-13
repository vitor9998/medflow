"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { MessageCircle, BellRing, Phone, CalendarDays } from "lucide-react";

export default function ComunicacaoPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 PROTEÇÃO + LOAD
  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      fetchAgendamentosFuturos(user.id);
    }

    init();
  }, []);

  async function fetchAgendamentosFuturos(userId: string) {
    // Para comunicação, idealmente pegamos tudo (ou podemos focar nos pendentes / confirmados)
    // Vamos pegar todos ordenados pela data e filtrar via JS se quiser, ou mostrar agendamentos recentes
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });

    if (error) {
      console.log("Erro ao buscar:", error);
    } else {
      setAgendamentos(data || []);
    }
    setIsLoading(false);
  }

  // Helper para montar link do Whatsapp
  const sendWhatsApp = (telefone: string, texto: string) => {
    const defaultDDI = telefone?.startsWith("55") ? "" : "55";
    const url = `https://wa.me/${defaultDDI}${telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight">Comunicação CRM</h1>
        <p className="text-slate-400 mt-1">Gerencie envio de mensagens e lembretes para os pacientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8 custom-scrollbar pr-2">
        {agendamentos.map((c) => (
          <Card key={c.id} className="p-6 flex flex-col hover:border-slate-700 transition-colors">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white leading-tight">{c.nome}</h3>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  c.status === "confirmado" ? "bg-emerald-500/10 text-emerald-400" :
                  c.status === "cancelado" ? "bg-red-500/10 text-red-500" :
                  "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 shrink-0">
                {c.nome?.substring(0,2).toUpperCase()}
              </div>
            </div>

            <div className="space-y-2 mb-6 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                 <CalendarDays className="w-4 h-4 text-slate-500" />
                 <span>{c.data?.split('-').reverse().join('/')} às {c.hora}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                 <Phone className="w-4 h-4 text-slate-500" />
                 <span>{c.telefone || "Sem telefone"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <button
                disabled={!c.telefone}
                onClick={() => sendWhatsApp(
                  c.telefone, 
                  `Olá ${c.nome}, sua consulta está ${c.status}. Data: ${c.data?.split('-').reverse().join('/')} às ${c.hora}.`
                )}
                className="flex items-center justify-center gap-2 w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Mensagem
              </button>

              <button
                disabled={!c.telefone}
                onClick={() => sendWhatsApp(
                  c.telefone, 
                  `Olá ${c.nome}, esse é um lembrete automático. Lembrando da sua consulta amanhã às ${c.hora}.`
                )}
                className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BellRing className="w-4 h-4" /> Lembrete Automático
              </button>
            </div>
          </Card>
        ))}

        {agendamentos.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center text-slate-500 py-10">
            Nenhum registro para comunicação encontrado.
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}} />

    </div>
  );
}
