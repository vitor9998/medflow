"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { MessageCircle, BellRing, Phone, CalendarDays, User, Mail } from "lucide-react";
import { buildMensagemLembrete, determinarCanalComunicacao } from "@/lib/communication";

export default function ComunicacaoPage() {
  const router = useRouter();
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [clinicaId, setClinicaId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("role, clinica_id")
        .eq("id", user.id)
        .single();

      setCurrentUserId(user.id);
      setUserRole(prof?.role);
      setClinicaId(prof?.clinica_id);
      fetchAgendamentosFuturos(user.id, prof?.role, prof?.clinica_id);
    }

    init();
  }, []);

  async function fetchAgendamentosFuturos(userId: string, role?: string | null, cId?: string | null) {
    let query = supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: false });

    if (role === "secretaria" && cId) {
      query = query.eq("clinica_id", cId);
    } else {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Erro ao buscar:", error);
    } else {
      // AGRUPAMENTO POR PACIENTE (Telefone)
      const agendamentosRaw = data || [];
      const hojeStr = new Date().toISOString().split('T')[0];
      
      const pacientesMap = new Map<string, any>();

      agendamentosRaw.forEach((ag: any) => {
        const key = ag.telefone || ag.email || ag.id;
        const existente = pacientesMap.get(key);

        if (!existente) {
          pacientesMap.set(key, ag);
        } else {
          // Lógica de relevância:
          // 1. Prioriza consultas futuras (>= hoje)
          // 2. Entre futuras, a mais próxima (data ASC)
          // 3. Se ambas passadas, a mais recente (data DESC)
          
          const agData = `${ag.data}T${ag.hora}`;
          const exData = `${existente.data}T${existente.hora}`;
          
          const agIsFutura = ag.data >= hojeStr;
          const exIsFutura = existente.data >= hojeStr;

          if (agIsFutura && !exIsFutura) {
            pacientesMap.set(key, ag);
          } else if (agIsFutura && exIsFutura) {
            if (agData < exData) pacientesMap.set(key, ag);
          } else if (!agIsFutura && !exIsFutura) {
            if (agData > exData) pacientesMap.set(key, ag);
          }
        }
      });

      setAgendamentos(Array.from(pacientesMap.values()));
    }
    setIsLoading(false);
  }

  const dispararLembretesDeAmanha = async (isSandbox: boolean = false) => {
    if (!currentUserId) return;
    
    if (!isSandbox) {
      const confirmou = window.confirm(
        "Isso pode reenviar mensagens para pacientes que ainda não receberam o lembrete de amanhã. Deseja continuar?"
      );
      if (!confirmou) return;
    }

    setIsSendingReminders(true);

    try {
      const amanha = new Date();
      amanha.setDate(amanha.getDate() + 1);
      const dataAmanhaFormatada = amanha.toISOString().split('T')[0];

      // Busca consultas de amanhã
      let query = supabase
        .from("agendamentos")
        .select("*")
        .eq("data", dataAmanhaFormatada);

      if (userRole === "secretaria" && clinicaId) {
        query = query.eq("clinica_id", clinicaId);
      } else {
        query = query.eq("user_id", currentUserId);
      }

      const { data: consultasAmanha, error: fError } = await query;
      if (fError) throw fError;

      const totalEncontrados = (consultasAmanha || []).length;
      
      // Filtra apenas pendentes se NÃO for sandbox
      // Se for sandbox, enviamos todos mas para o email do proprio usuario
      const pendentes = isSandbox 
        ? (consultasAmanha || []) 
        : (consultasAmanha || []).filter((c: any) => !c.lembrete_enviado);

      if (pendentes.length === 0) {
        alert(
          isSandbox 
            ? "Não há consultas agendadas para amanhã para testar." 
            : "Todas as consultas de amanhã já possuem lembretes enviados."
        );
        setIsSendingReminders(false);
        return;
      }

      // Prepara o canal para cada um
      const pendentesComCanal = pendentes.map((p: any) => ({
        ...p,
        canal_utilizado: determinarCanalComunicacao(p)
      }));

      // 1. Enviar emails via API backend
      const res = await fetch('/api/lembretes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pendentes: pendentesComCanal, 
          sandboxEmail: isSandbox ? (await supabase.auth.getUser()).data.user?.email : null 
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erro ao disparar envio de emails");
      }

      const report = await res.json();
      const resultados = report.resultados || [];
      const enviados = resultados.filter((r: any) => r.status === "enviado").length;
      const semEmail = resultados.filter((r: any) => r.status === "sem_email").length;
      const falhas = resultados.filter((r: any) => r.status === "falha").length;

      if (!isSandbox) {
        const enviadosIds = resultados
          .filter((r: any) => r.status === "enviado")
          .map((r: any) => r.id);

        for (const id of enviadosIds) {
           await supabase
             .from("agendamentos")
             .update({ lembrete_enviado: true })
             .eq("id", id);
        }
      }

      const ignorados = totalEncontrados - pendentes.length;
      
      let msgFinal = isSandbox
        ? `Sucesso! Foram enviados ${enviados} testes para o seu e-mail.`
        : `Processamento concluído!\n\n` +
          `✅ Enviados com sucesso: ${enviados}\n` +
          `⏩ Já haviam sido enviados: ${ignorados}\n`;
      
      if (semEmail > 0) {
        msgFinal += `⚠️ Sem e-mail cadastrado: ${semEmail} (Use o WhatsApp para estes)\n`;
      }
      
      if (falhas > 0) {
        msgFinal += `❌ Falhas técnicas: ${falhas}\n`;
      }

      alert(msgFinal);
      
      fetchAgendamentosFuturos(currentUserId, userRole, clinicaId);
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    } finally {
      setIsSendingReminders(false);
    }
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
      <div className="mb-10 shrink-0 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Comunicação com Pacientes</h1>
          <p className="text-slate-500 mt-1 text-sm max-w-md">
            Envie confirmações e lembretes para garantir que seus pacientes não faltem às consultas.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3">
          <button 
            onClick={() => dispararLembretesDeAmanha(false)}
            disabled={isSendingReminders}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 justify-center active:scale-95 border border-slate-200/50"
          >
            <Mail className="w-4 h-4" />
            {isSendingReminders ? "Enviando..." : "Enviar lembretes automáticos por e-mail"}
          </button>
          <p className="text-[11px] text-slate-400 text-right max-w-[280px] leading-relaxed">
            Os lembretes automáticos são enviados por e-mail. Para falar com o paciente mais rápido, use o WhatsApp abaixo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 overflow-y-auto pb-8 pr-2">
        {agendamentos.map((c: any) => {
          const hojeStr = new Date().toISOString().split('T')[0];
          const isFutura = c.data >= hojeStr;
          const dataBr = c.data?.split('-').reverse().join('/');
          const canal = determinarCanalComunicacao(c);
          const mensagemLembrete = buildMensagemLembrete(c);

          return (
            <Card key={c.id} className="p-5 flex flex-col hover:border-blue-200 transition-all group border-l-4 border-l-blue-500 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shrink-0 border border-slate-200">
                    {c.nome?.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{c.nome}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="text-[11px] font-medium text-slate-500">{c.telefone || "Sem telefone"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {canal === "whatsapp" ? (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[9px] font-bold border border-emerald-100">
                             <MessageCircle className="w-2.5 h-2.5" /> Contato preferencial: WhatsApp
                          </div>
                        ) : canal === "email" ? (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold border border-blue-100">
                             <Mail className="w-2.5 h-2.5" /> Contato alternativo: E-mail
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded-md text-[9px] font-bold border border-slate-100">
                             Sem canal de contato
                          </div>
                        )}
                        {!c.email && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-[9px] font-bold border border-gray-200">
                             Sem e-mail
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  c.status === "confirmado" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                  c.status === "cancelado" ? "bg-red-50 text-red-600 border border-red-100" :
                  "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {c.status}
                </span>
              </div>

              <div className={`rounded-xl p-4 mb-5 border transition-colors ${
                isFutura 
                  ? "bg-blue-50/50 border-blue-100 shadow-sm shadow-blue-500/5" 
                  : "bg-slate-50 border-slate-100"
              }`}>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${
                  isFutura ? "text-blue-600" : "text-slate-400"
                }`}>
                  <CalendarDays className={`w-3 h-3 ${isFutura ? "text-blue-500" : "text-slate-400"}`} />
                  {isFutura ? "Próxima Consulta" : "Última Consulta"}
                </p>
                <p className={`text-sm font-bold ${isFutura ? "text-slate-900" : "text-slate-600"}`}>
                  {dataBr} <span className="text-slate-400 font-normal ml-1">às</span> {c.hora}
                </p>
                
                <div className={`mt-3 pt-3 border-t flex items-center justify-between ${
                  isFutura ? "border-blue-100/50" : "border-slate-200/60"
                }`}>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Aviso automático:</span>
                   <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${
                     c.lembrete_enviado 
                       ? "bg-emerald-100 text-emerald-700" 
                       : isFutura ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-500"
                   }`}>
                     {c.lembrete_enviado ? "Enviado" : "Pendente"}
                   </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                <button
                  disabled={!c.telefone}
                  onClick={() => sendWhatsApp(
                    c.telefone, 
                    mensagemLembrete
                  )}
                  className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 active:scale-95 disabled:opacity-50 text-xs"
                >
                  <MessageCircle className="w-4 h-4" /> Enviar mensagem no WhatsApp
                </button>

                <button
                  disabled={!c.telefone && !c.email}
                  onClick={() => dispararLembretesDeAmanha(true)}
                  className="flex items-center justify-center gap-2 w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-all border border-slate-200 shadow-sm active:scale-95 disabled:opacity-50 text-xs"
                >
                  <BellRing className="w-4 h-4 text-amber-500" /> Enviar lembrete manual
                </button>
              </div>
            </Card>
          );
        })}

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
