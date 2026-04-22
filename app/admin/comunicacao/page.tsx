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

  const sendWhatsApp = (telefone: string, texto: string) => {
    const defaultDDI = telefone?.startsWith("55") ? "" : "55";
    const url = `https://wa.me/${defaultDDI}${telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Comunicacao</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie envio de mensagens e lembretes para os pacientes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-8 pr-2">
        {agendamentos.map((c) => (
          <Card key={c.id} className="p-5 flex flex-col hover:border-slate-300 transition-colors">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">{c.nome}</h3>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  c.status === "confirmado" ? "bg-emerald-50 text-emerald-600" :
                  c.status === "cancelado" ? "bg-red-50 text-red-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">
                {c.nome?.substring(0,2).toUpperCase()}
              </div>
            </div>

            <div className="space-y-2 mb-5 flex-1">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <CalendarDays className="w-4 h-4 text-slate-400" />
                 <span>{c.data?.split('-').reverse().join('/')} as {c.hora}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                 <Phone className="w-4 h-4 text-slate-400" />
                 <span>{c.telefone || "Sem telefone"}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <button
                disabled={!c.telefone}
                onClick={() => sendWhatsApp(
                  c.telefone, 
                  `Ola ${c.nome}, sua consulta esta ${c.status}. Data: ${c.data?.split('-').reverse().join('/')} as ${c.hora}.`
                )}
                className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Enviar Mensagem
              </button>

              <button
                disabled={!c.telefone}
                onClick={() => sendWhatsApp(
                  c.telefone, 
                  `Ola ${c.nome}, esse e um lembrete automatico. Lembrando da sua consulta amanha as ${c.hora}.`
                )}
                className="flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <BellRing className="w-4 h-4" /> Lembrete Automatico
              </button>
            </div>
          </Card>
        ))}

        {agendamentos.length === 0 && (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-500">Nenhum registro encontrado</p>
            <p className="text-xs text-slate-400 mt-1">Agendamentos aparecerão aqui para comunicacao.</p>
          </div>
        )}
      </div>
    </div>
  );
}
