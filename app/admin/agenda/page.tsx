"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Loader2, KeyRound, Wand2, Calendar as CalIcon, MapPin, User, LogOut, CheckCircle2, Bot, Phone, Plus, Map, Mail, Hash, PhoneOutgoing, ShieldCheck, Download, AlertCircle, Edit, Trash2, CalendarDays, X, ChevronRight, Check, MessageCircle, BrainCircuit, Save, Activity, Paperclip, FileText, ClipboardList, Stethoscope, XCircle } from "lucide-react";

export default function AgendaPage() {
  const router = useRouter();

  const [consultas, setConsultas] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // EHR States
  const [obsText, setObsText] = useState("");
  const [diagnosticoText, setDiagnosticoText] = useState("");
  const [iaSummary, setIaSummary] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSavingEhr, setIsSavingEhr] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [evolucaoText, setEvolucaoText] = useState("");
  const [isSavingEvolucao, setIsSavingEvolucao] = useState(false);

  const calendarRef = useRef<any>(null);

  useEffect(() => {
    if (selecionada) {
       setObsText(selecionada.observacoes_medico || "");
       setDiagnosticoText(selecionada.diagnostico_final || "");
       setIaSummary(selecionada.resumo_ia || "");
       setEvolucaoText(selecionada.evolucao || "");
    }
  }, [selecionada]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const currentIsMobile = window.innerWidth < 768;
      setIsMobile(currentIsMobile);
      
      // Força a atualização do calendário se ele já montou
      if (calendarRef.current) {
        calendarRef.current.getApi().changeView(currentIsMobile ? "timeGridDay" : "timeGridWeek");
      }

      fetchConsultas(user.id);
    }
    init();
  }, []);

  async function fetchConsultas(userId: string) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: true });

    if (error) {
      console.log("Erro ao buscar agendamentos", error);
    } else {
      setConsultas(data || []);
    }
    setIsLoading(false);
  }

  async function atualizarStatus(id: number, status: string) {
    const { error } = await supabase
      .from("agendamentos")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status.");
      return;
    }

    setConsultas((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
    setSelecionada(null); // Fecha o modal
  }

  const enviarWhatsApp = (consulta: any) => {
    const dataBr = consulta.data.split('-').reverse().join('/');
    const msg = `Olá, ${consulta.nome}! Tudo bem? Apenas passando para lembrar e confirmar o seu agendamento médico no dia *${dataBr}* às *${consulta.hora}*. Podemos confirmar sua presença?`;
    const foneLimpo = consulta.telefone ? consulta.telefone.replace(/\D/g, '') : '';
    const prefixo = foneLimpo.length <= 11 ? '55' : ''; // Brasil default fallback
    const url = `https://wa.me/${prefixo}${foneLimpo}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  async function salvarProntuario() {
    setIsSavingEhr(true);
    const { error } = await supabase
      .from("agendamentos")
      .update({ 
         observacoes_medico: obsText, 
         diagnostico_final: diagnosticoText,
         resumo_ia: iaSummary
      })
      .eq("id", selecionada.id);
      
    if (error) {
      alert("Erro ao gravar prontuário no banco.");
    } else {
      // Atualiza o estado local para não perder
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === selecionada.id ? { ...item, observacoes_medico: obsText, diagnostico_final: diagnosticoText, resumo_ia: iaSummary } : item
        )
      );
      alert("Prontuário Médico salvo e ancorado com sucesso!");
    }
    setIsSavingEhr(false);
  }

  async function salvarEvolucao() {
    setIsSavingEvolucao(true);
    const { error } = await supabase
      .from("agendamentos")
      .update({ evolucao: evolucaoText })
      .eq("id", selecionada.id);
      
    if (error) {
      alert("Erro ao gravar evolução.");
    } else {
      setConsultas((prev) =>
        prev.map((item) =>
          item.id === selecionada.id ? { ...item, evolucao: evolucaoText } : item
        )
      );
      // alert("Evolução salva com sucesso!"); // Optional, you can let it save silently or with alert
    }
    setIsSavingEvolucao(false);
  }

  async function gerarResumoIA() {
     setIsAiLoading(true);
     // Simula a requisição externa à API da OpenAI (Fase 4 - Mock Módulo)
     setTimeout(() => {
       const mockSummary = `🩺 **Resumo Clínico Gerado por IA:** \nPaciente apresenta quadro onde a queixa inicial foi: "${selecionada.sintomas}". \n\nDurante a anamnese, o profissional reportou: "${obsText}". \n\n**A hipótese diagnóstica firmada:** ${diagnosticoText || 'Não classificada'}. \n\nRecomenda-se acompanhamento padrão conforme diretrizes aplicáveis.`;
       setIaSummary(mockSummary);
       setIsAiLoading(false);
     }, 2000);
  }

  async function visualizarAnexo(path: string) {
    setIsGeneratingLink(true);
    // Cria Signed URL temporária de 90 segundos para visualização do Médico
    const { data, error } = await supabase.storage.from("exames").createSignedUrl(path, 90);
    setIsGeneratingLink(false);
    
    if (error || !data) {
       alert("Erro ao decodificar arquivo sigiloso: " + error?.message);
       return;
    }
    
    // Abre PDF ou Imagem em nova aba
    window.open(data.signedUrl, "_blank");
  }

  const getStatusVisual = (c: any) => {
    const agora = new Date();
    const dataConsulta = new Date(`${c.data}T${c.hora}`);
    const jaPassou = dataConsulta < agora;

    // 1. ESTADOS EXPLÍCITOS (Prioridade Total)
    if (c.status === 'presente') {
      return { 
        className: "event-status-confirmado",
        label: "Paciente presente", 
        description: "Paciente compareceu ao atendimento",
        bg: "bg-emerald-50", text: "text-emerald-600" 
      };
    }

    if (c.status === 'cancelado') {
      return { 
        className: "event-status-cancelado",
        label: "Agendamento cancelado", 
        description: "Este agendamento foi cancelado",
        bg: "bg-slate-50", text: "text-slate-600" 
      };
    }

    // 2. LÓGICA DE CONSULTAS PASSADAS (Faltas)
    if (jaPassou) {
      return { 
        className: "event-status-risco",
        label: "Falta", 
        description: "Paciente não compareceu ao horário agendado",
        bg: "bg-red-50", text: "text-red-600" 
      };
    }

    // 3. LÓGICA DE CONSULTAS FUTURAS (Confirmação e Risco)
    if (c.confirmacao_status === 'confirmado' || c.status === 'confirmado') {
      return { 
        className: "event-status-confirmado",
        label: "Confirmado", 
        description: "Paciente confirmou presença para este horário",
        bg: "bg-emerald-50", text: "text-emerald-600" 
      };
    }

    if (c.confirmacao_status === 'sem_resposta' || (c.tentativas_contato || 0) >= 2) {
      return { 
        className: "event-status-risco",
        label: "Risco de falta", 
        description: "Paciente não respondeu às tentativas de confirmação",
        bg: "bg-red-50", text: "text-red-600" 
      };
    }

    return { 
      className: "event-status-aguardando",
      label: "Aguardando confirmação", 
      description: "Aguardando resposta do paciente ao lembrete automático",
      bg: "bg-amber-50", text: "text-amber-600" 
    };
  };

  const eventos = consultas.map((c) => {
    const visual = getStatusVisual(c);
    return {
      id: String(c.id),
      title: `${c.nome} - ${visual.label}`,
      date: `${c.data}T${c.hora}`,
      className: visual.className,
      // Passamos os dados para o modal
      extendedProps: { ...c }
    };
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full overflow-hidden">
      
      <div className="mb-4 sm:mb-6 shrink-0 mt-2 sm:mt-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Agenda</h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">Gerencie os agendamentos e horarios da clinica.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-4 shadow-sm flex-1 flex flex-col min-h-0 w-full">
        <div className="bg-slate-50 rounded-xl p-1 sm:p-4 flex-1 overflow-x-auto overflow-y-hidden text-slate-700 w-full relative agenda-calendar-wrapper">
          <div className="min-w-full h-full">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, listPlugin]}
              initialView="timeGridWeek" // Default, alterado no useEffect
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: isMobile 
                  ? "listMonth,timeGridWeek,timeGridDay" 
                  : "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              buttonText={{
                listMonth: "mês",
                dayGridMonth: "mês",
                timeGridWeek: "semana",
                timeGridDay: "dia",
                today: "hoje"
              }}
              windowResizeDelay={100}
            events={eventos}
            height="100%"
            slotMinTime="08:00:00"
            slotMaxTime="18:00:00"
            allDaySlot={false}
              eventClick={(info) => {
                const consulta = consultas.find(
                  (c) => String(c.id) === info.event.id
                );
                setSelecionada({ ...consulta, ia_retries: 0 });

                // Auto-gerar resumo_ia se nao tiver
                if (consulta && !consulta.resumo_ia && (consulta.sintomas || consulta.observacoes_paciente)) {
                  fetch('/api/ai/resumo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      id: consulta.id,
                      sintomas: consulta.sintomas,
                      observacoes_paciente: consulta.observacoes_paciente
                    })
                  }).then(res => res.json()).then(data => {
                    if (data.resumo_ia) {
                       setSelecionada((prev: any) => prev?.id === consulta.id ? { ...prev, resumo_ia: data.resumo_ia } : prev);
                       setConsultas((prevList: any) => prevList.map((c: any) => c.id === consulta.id ? { ...c, resumo_ia: data.resumo_ia } : c));
                    } else if (data.error) {
                       setSelecionada((prev: any) => prev?.id === consulta.id ? { ...prev, ia_error: data.error } : prev);
                    }
                  }).catch(err => {
                    setSelecionada((prev: any) => prev?.id === consulta.id ? { ...prev, ia_error: "Erro de conexao" } : prev);
                    console.error("Erro AI:", err);
                  });
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal 
        isOpen={!!selecionada} 
        onClose={() => setSelecionada(null)} 
        title="Detalhes do Agendamento"
        maxWidth="max-w-2xl"
      >
        {selecionada && (
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Paciente</p>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{selecionada.nome}</h2>
                <p className="text-sm text-slate-500 mt-1.5">{selecionada.email || "Sem e-mail cadastrado"}</p>
              </div>
              <div className="text-right">
                 {(() => {
                    const visual = getStatusVisual(selecionada);
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${visual.bg} ${visual.text} border border-current/20`}>
                        {visual.label}
                      </span>
                    );
                 })()}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm text-slate-400 font-medium">Data e Horario</p>
                <p className="font-semibold text-slate-800">{selecionada.data.split('-').reverse().join('/')} as {selecionada.hora}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400 font-medium">WhatsApp</p>
                <p className="font-semibold text-slate-800">{selecionada.telefone || "Nao informado"}</p>
              </div>
            </div>

            {/* ALERTAS CLÍNICOS E OPERACIONAIS */}
            {(() => {
              const alertas = [];
              const agora = new Date();
              const dataConsulta = new Date(`${selecionada.data}T${selecionada.hora}`);
              const diffMs = dataConsulta.getTime() - agora.getTime();
              const diffHoras = diffMs / (1000 * 60 * 60);

              if (selecionada.confirmacao_status === 'sem_resposta') {
                alertas.push({
                  text: "Paciente não respondeu às tentativas de confirmação",
                  action: { label: "Entrar em contato", onClick: () => enviarWhatsApp(selecionada) }
                });
              }
              
              const temFaltas = consultas.some(c => 
                (c.paciente_id === selecionada.paciente_id || c.telefone === selecionada.telefone) && 
                c.id !== selecionada.id &&
                (new Date(`${c.data}T${c.hora}`) < agora) && 
                c.status !== 'presente' && c.status !== 'cancelado'
              );
              
              const isPendente = selecionada.status !== 'confirmado' && selecionada.status !== 'presente' && selecionada.status !== 'cancelado' && selecionada.confirmacao_status !== 'confirmado';

              if (temFaltas && isPendente) {
                alertas.push({
                  text: "Paciente possui histórico de faltas não justificadas",
                  action: { 
                    label: "Confirmar manualmente", 
                    sublabel: "Força a confirmação mesmo sem resposta do paciente",
                    onClick: () => atualizarStatus(selecionada.id, "confirmado") 
                  }
                });
              }

              if (diffHoras > 0 && diffHoras < 2 && selecionada.status !== 'presente' && selecionada.status !== 'cancelado') {
                alertas.push({
                  text: "Consulta próxima do horário (menos de 2h)",
                  action: { 
                    label: "Preparar atendimento", 
                    onClick: () => {
                      const ehr = document.querySelector('textarea');
                      ehr?.focus();
                      ehr?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                });
              }

              if (alertas.length === 0) return null;

              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> Atenção
                  </p>
                  <div className="space-y-4">
                    {alertas.slice(0, 2).map((alerta, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-l-2 border-amber-200 pl-3">
                        <p className="text-xs text-amber-900 font-medium pt-1">
                          {alerta.text}
                        </p>
                        <div className="flex flex-col items-end gap-1">
                          <button 
                            onClick={alerta.action.onClick}
                            className="text-[10px] bg-white hover:bg-amber-100 text-amber-700 font-bold py-1.5 px-3 rounded-lg border border-amber-200 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                          >
                            {alerta.action.label}
                          </button>
                          {alerta.action.sublabel && (
                            <span className="text-[9px] text-amber-600/70 font-medium max-w-[150px] text-right leading-tight">
                              {alerta.action.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* PRONTUÁRIO LEVE - VISUALIZAÇÃO DO PACIENTE */}
            <div className="bg-white border text-left border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm border-t-4 border-t-emerald-500">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-2">
                 <div className="bg-emerald-50 p-2 rounded-xl">
                    <Stethoscope className="w-6 h-6 text-emerald-600" />
                 </div>
                 Resumo Rápido
              </h3>

              {/* Resumo do paciente (IA) */}
              {(selecionada.resumo_ia || (selecionada.sintomas && !selecionada.resumo_ia)) && (
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-3">
                     <Bot className="w-4 h-4" /> Sintese da IA
                   </p>
                   {selecionada.resumo_ia ? (
                     <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-100 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                       {selecionada.resumo_ia}
                     </div>
                    ) : selecionada.ia_error ? (
                      <div className="space-y-3">
                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm transition-all hover:bg-amber-100/50">
                          <div className="flex items-center gap-2 text-amber-700">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-sm font-semibold tracking-tight">
                              {(selecionada.ia_retries || 0) >= 3 
                                ? "IA temporariamente indisponível" 
                                : "Resumo inteligente falhou"}
                            </p>
                          </div>
                          
                          {(selecionada.ia_retries || 0) < 3 && (
                            <button 
                              onClick={() => {
                                const nextRetry = (selecionada.ia_retries || 0) + 1;
                                setSelecionada((prev: any) => ({ ...prev, ia_error: null, ia_retries: nextRetry }));
                                
                                fetch('/api/ai/resumo', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    id: selecionada.id,
                                    sintomas: selecionada.sintomas,
                                    observacoes_paciente: selecionada.observacoes_paciente
                                  })
                                }).then(res => res.json()).then(data => {
                                  if (data.resumo_ia) {
                                     setSelecionada((prev: any) => ({ ...prev, resumo_ia: data.resumo_ia }));
                                     setConsultas((prevList: any) => prevList.map((c: any) => c.id === selecionada.id ? { ...c, resumo_ia: data.resumo_ia } : c));
                                  } else if (data.error) {
                                     setSelecionada((prev: any) => ({ ...prev, ia_error: data.error }));
                                  }
                                }).catch(err => {
                                  setSelecionada((prev: any) => ({ ...prev, ia_error: "Erro de conexao" }));
                                });
                              }}
                              className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm transition-all active:scale-95 whitespace-nowrap"
                            >
                              Gerar resumo ({3 - (selecionada.ia_retries || 0)})
                            </button>
                          )}
                        </div>

                        {/* Fallback Summary */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-slate-400">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="w-4 h-4" /> Resumo Básico (Extraído da Queixa)
                          </p>
                          <ul className="space-y-1">
                            {(selecionada.sintomas || "")
                              .split(/[.,\n]/)
                              .filter((frase: string) => frase.trim().length > 3)
                              .slice(0, 3)
                              .map((frase: string, idx: number) => (
                                <li key={idx} className="text-sm text-slate-700 flex items-start gap-2">
                                  <span className="text-slate-400 mt-1">•</span>
                                  <span className="capitalize">{frase.trim()}</span>
                                </li>
                              ))}
                            {(!selecionada.sintomas || selecionada.sintomas.length < 5) && (
                              <li className="text-sm text-slate-500 italic">Informações insuficientes para gerar resumo básico.</li>
                            )}
                          </ul>
                        </div>
                      </div>
                    ) : (
                     <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3 text-slate-500 text-sm font-medium shadow-sm">
                       <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> 🧠 Gerando resumo clínico...
                     </div>
                   )}
                </div>
              )}

              {/* Queixa e Observações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                     <Activity className="w-4 h-4 text-slate-500" /> Queixa Principal
                   </p>
                   <p className="text-sm font-medium text-slate-800 leading-relaxed">{selecionada.sintomas || "Não informada."}</p>
                 </div>
                 
                 <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                     <ClipboardList className="w-4 h-4 text-slate-500" /> Observações
                   </p>
                   <p className="text-sm font-medium text-slate-800 leading-relaxed">{selecionada.observacoes_paciente || "Nenhuma observação informada."}</p>
                 </div>
              </div>

              {/* Exames */}
              {selecionada.anexo_path && (
                <div>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                     <FileText className="w-4 h-4" /> Exames / Laudos
                   </p>
                   {(() => {
                       const parts = selecionada.anexo_path.split('/');
                       const name = parts[parts.length - 1];
                       let datestr = "Data de envio não registrada";
                       
                       const tsStr = name.split('_')[0];
                       const ts = parseInt(tsStr);
                       if (!isNaN(ts) && ts > 1700000000000) {
                          datestr = new Date(ts).toLocaleString('pt-BR', { 
                             day: '2-digit', month: '2-digit', year: 'numeric', 
                             hour: '2-digit', minute: '2-digit' 
                          });
                       } else if (!isNaN(ts) && ts > 1600000000000) {
                          datestr = new Date(ts).toLocaleString('pt-BR', { 
                             day: '2-digit', month: '2-digit', year: 'numeric', 
                             hour: '2-digit', minute: '2-digit' 
                          });
                       }

                       return (
                          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-emerald-300 transition-all group">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors border border-emerald-100">
                                   <FileText className="w-6 h-6" />
                                </div>
                                <div className="text-left max-w-full overflow-hidden">
                                  <p className="text-sm font-extrabold text-slate-800 break-all line-clamp-1">{name}</p>
                                  <p className="text-xs text-slate-500 font-medium mt-1">Enviado em: {datestr}</p>
                                </div>
                             </div>
                             <button
                               onClick={() => visualizarAnexo(selecionada.anexo_path)}
                               disabled={isGeneratingLink}
                               className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-emerald-500 hover:bg-emerald-600 focus:ring-4 focus:ring-emerald-500/20 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md shadow-emerald-500/20 shrink-0"
                             >
                               {isGeneratingLink ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>}
                               {isGeneratingLink ? "Abrindo..." : "Abrir Exame"}
                             </button>
                          </div>
                       );
                   })()}
                </div>
              )}
            </div>

            {/* HISTÓRICO DO PACIENTE */}
            {(() => {
               const historico = consultas.filter(c => c.telefone === selecionada.telefone && c.id !== selecionada.id).sort((a,b) => {
                  const dataA = new Date(`${a.data}T${a.hora}`);
                  const dataB = new Date(`${b.data}T${b.hora}`);
                  return dataB.getTime() - dataA.getTime();
               });

               if (historico.length === 0) return null;

               return (
                 <div className="bg-white border text-left border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
                   <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
                      <div className="bg-indigo-50 p-1.5 rounded-lg">
                         <CalendarDays className="w-5 h-5 text-indigo-600" />
                      </div>
                      Histórico do Paciente
                      <span className="ml-auto text-xs font-black bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">{historico.length} {historico.length === 1 ? "registro" : "registros"}</span>
                   </h3>

                   <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                     {historico.map(h => {
                         let datestr = "";
                         let name = "";
                         if (h.anexo_path) {
                            name = h.anexo_path.split('/').pop() || "";
                            const ts = parseInt(name.split('_')[0]);
                            if (!isNaN(ts) && ts > 1600000000000) {
                               datestr = new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
                            }
                         }

                         return (
                           <div key={h.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                <p className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                   <CalendarDays className="w-4 h-4 text-slate-400" /> 
                                   {h.data.split('-').reverse().join('/')} às {h.hora}
                                </p>
                                <span className={`w-fit text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider ${
                                   h.status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
                                   h.status === "cancelado" ? "bg-red-100 text-red-700" :
                                   "bg-amber-100 text-amber-700"
                                }`}>
                                   {h.status || "PENDENTE"}
                                </span>
                              </div>
                              <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                <span className="font-semibold text-slate-700">Queixa:</span> {h.sintomas || "Não informada"}
                              </p>

                              {h.evolucao && (
                                <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 mb-4">
                                  <p className="text-xs font-bold text-purple-700 mb-1 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Evolução Clínica</p>
                                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{h.evolucao}</p>
                                </div>
                              )}

                              {h.anexo_path && (
                                <button 
                                  onClick={() => visualizarAnexo(h.anexo_path)}
                                  className="w-full flex items-center justify-center gap-2 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2.5 rounded-lg transition-colors border border-indigo-200 mb-2 px-2"
                                >
                                  <FileText className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">Abrir Exame ({name})</span>
                                </button>
                              )}
                              
                              <button 
                                onClick={() => setSelecionada(h)}
                                className="w-full flex items-center justify-center gap-2 text-xs bg-white hover:bg-slate-100 text-slate-600 font-bold py-2.5 rounded-lg transition-colors border border-slate-200"
                              >
                                Visualizar Consulta Completa
                              </button>
                           </div>
                         );
                     })}
                   </div>
                 </div>
               );
            })()}

            {/* EHR AREA */}
            <div className="border border-slate-200 bg-slate-50/50 p-5 rounded-2xl space-y-5">
              <h3 className="font-bold text-slate-700 border-b border-slate-100 pb-3 mb-1 flex justify-between items-center text-sm uppercase tracking-wider">
                Prontuário Médico
                <span className="text-[9px] font-black uppercase bg-slate-200/50 text-slate-500 px-2 py-0.5 rounded-full">Anamnese & Diagnóstico</span>
              </h3>
              
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Observacoes da Consulta</label>
                <textarea 
                  value={obsText}
                  onChange={e => setObsText(e.target.value)}
                  placeholder="Relate os achados do exame clínico, pressão, queixas e orientações..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all min-h-[100px] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">C.I.D. ou Diagnostico Final</label>
                <input 
                  value={diagnosticoText}
                  onChange={e => setDiagnosticoText(e.target.value)}
                  type="text"
                  placeholder="Ex: J01 - Sinusite aguda"
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* MÓDULO INTELIGÊNCIA ARTIFICIAL */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mt-4 relative overflow-hidden">
                 <div className="relative z-10">
                   <div className="flex items-center justify-between mb-3">
                     <p className="text-sm font-semibold text-blue-600 flex items-center gap-2">
                       <BrainCircuit className="w-4 h-4" /> Resumo Clinico (Medsys AI)
                     </p>
                     <button 
                       onClick={gerarResumoIA}
                       disabled={isAiLoading || (!obsText && !selecionada.sintomas)}
                       className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-1.5 px-3 rounded-md transition-colors"
                     >
                       {isAiLoading ? "Processando..." : "Mágico: Gerar IA"}
                     </button>
                   </div>
                   
                   {iaSummary ? (
                     <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                       {iaSummary}
                     </div>
                   ) : (
                     <p className="text-xs text-slate-500 italic">O resumo autogerado aparecerá aqui quando solicitado.</p>
                   )}
                 </div>
              </div>
              
              <button
                onClick={salvarProntuario}
                disabled={isSavingEhr}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" /> {isSavingEhr ? "Arquivando..." : "Finalizar Anamnese"}
              </button>
            </div>

            {/* SEÇÃO EVOLUÇÃO */}
            <div className="border border-purple-200 bg-purple-50 p-4 rounded-xl space-y-4">
               <h3 className="font-bold text-purple-700 border-b border-purple-200 pb-2 mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Evolução do Atendimento
               </h3>
               <textarea 
                  value={evolucaoText}
                  onChange={e => setEvolucaoText(e.target.value)}
                  placeholder="Registre os detalhes da evolução clínica do paciente, novos sintomas, ou progresso do tratamento..."
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-200 transition-all min-h-[100px] resize-y"
               />
               <button
                  onClick={salvarEvolucao}
                  disabled={isSavingEvolucao}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-3 mt-2 rounded-lg transition-colors"
               >
                  <Save className="w-4 h-4" /> {isSavingEvolucao ? "Salvando..." : "Salvar Evolução"}
               </button>
            </div>

            <div className="pt-2 px-1">
              {(() => {
                const visual = getStatusVisual(selecionada);
                return (
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className={`mt-0.5 p-1 rounded-full ${visual.bg} ${visual.text}`}>
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-700 font-bold leading-none">{visual.description}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Status atualizado pelo sistema em tempo real</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ACTIONS - Only show for future or current appointments */}
            {(() => {
              const agora = new Date();
              const dataConsulta = new Date(`${selecionada.data}T${selecionada.hora}`);
              const isPassado = dataConsulta < agora;

              if (isPassado) return (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <CalendarDays className="w-4 h-4" />
                   </div>
                   <p className="text-xs text-slate-500 font-medium italic">
                      Ações de status desabilitadas para consultas passadas.
                   </p>
                </div>
              );

              return (
                <>
                  {selecionada.status !== 'presente' && selecionada.status !== 'cancelado' && (
                    <button
                      onClick={() => atualizarStatus(selecionada.id, "presente")}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2 active:scale-95"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Marcar como PRESENTE
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    {selecionada.status !== 'cancelado' && (
                      <>
                        {(() => {
                          const visual = getStatusVisual(selecionada);
                          const isHighRisk = visual.label.includes("Risco");
                          
                          return (
                            <button
                              onClick={() => enviarWhatsApp(selecionada)}
                              className={`flex justify-center items-center gap-2 font-bold py-3 rounded-2xl transition-all border ${
                                isHighRisk 
                                  ? "bg-red-50 border-red-100 text-red-600 hover:bg-red-100" 
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              }`}
                            >
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-xs uppercase tracking-tight">{isHighRisk ? "Cobrar Resposta" : "Enviar Lembrete"}</span>
                            </button>
                          );
                        })()}

                        <button
                          onClick={() => atualizarStatus(selecionada.id, "cancelado")}
                          className="flex justify-center items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-400 hover:text-slate-600 font-bold py-3 rounded-2xl transition-all text-xs uppercase tracking-tight"
                        >
                          <XCircle className="w-4 h-4" /> Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </Modal>

      {/* Global styles fix for FullCalendar in dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .agenda-calendar-wrapper {
           --fc-border-color: #e2e8f0;
           --fc-button-text-color: #475569;
           --fc-button-bg-color: #ffffff;
           --fc-button-border-color: #e2e8f0;
           --fc-button-hover-bg-color: #f1f5f9;
           --fc-button-hover-border-color: #cbd5e1;
           --fc-button-active-bg-color: #e2e8f0;
           --fc-button-active-border-color: #cbd5e1;
           --fc-today-bg-color: rgba(59, 130, 246, 0.04);
           --fc-page-bg-color: #f8fafc;
           --fc-neutral-bg-color: #f1f5f9;
           --fc-list-event-hover-bg-color: #f1f5f9;
        }

        .fc-header-toolbar {
           flex-wrap: wrap;
           gap: 0.5rem;
           margin-bottom: 1rem !important;
        }

        @media (max-width: 640px) {
           .fc-toolbar-title { font-size: 1.1rem !important; }
           .fc .fc-toolbar { flex-direction: column; align-items: center; justify-content: center; gap: 8px; }
           .fc-toolbar-chunk:first-child { display: flex; width: 100%; justify-content: space-between; }
           .fc-toolbar-chunk:nth-child(2) { text-align: center; }
           .fc-header-toolbar { padding-bottom: 8px; border-bottom: 1px solid #e2e8f0; }
           .fc-view-harness { min-height: 500px; }
        }

        .fc .fc-toolbar-title { font-size: 1.25rem; font-weight: 600; color: #1e293b; }
        .fc th { color: #94a3b8; font-weight: 500; font-size: 0.8rem; padding: 0.5rem 0; text-transform: uppercase; letter-spacing: 0.5px;}
        .fc-theme-standard td, .fc-theme-standard th { border-color: var(--fc-border-color); }
        .fc .fc-button { border-radius: 0.5rem; text-transform: capitalize; padding: 0.4rem 0.8rem; font-size: 0.875rem;}
        .fc-timegrid-slot-label { font-size: 0.75rem; color: #94a3b8; }
        
        /* Custom Event Styling */
        .fc-event {
           border-radius: 6px !important;
           border-width: 0 !important;
           border-left-width: 4px !important;
           padding: 2px 4px !important;
           font-size: 0.75rem !important;
           font-weight: 600 !important;
           box-shadow: 0 1px 2px rgba(0,0,0,0.05);
           cursor: pointer;
           transition: transform 0.1s ease;
        }

        .fc-event:hover {
           transform: scale(1.02);
           z-index: 50;
        }

        .fc-v-event .fc-event-main {
           color: inherit !important;
        }

        .fc-timegrid-event .fc-event-title {
           font-weight: 700 !important;
        }

        /* Status Colors */
        .event-status-confirmado {
           background-color: #ecfdf5 !important;
           border-left-color: #10b981 !important;
           color: #065f46 !important;
        }
        .event-status-confirmado .fc-event-main,
        .event-status-confirmado .fc-event-title,
        .event-status-confirmado .fc-event-time {
           color: #065f46 !important;
        }

        .event-status-risco {
           background-color: #fef2f2 !important;
           border-left-color: #ef4444 !important;
           color: #991b1b !important;
        }
        .event-status-risco .fc-event-main,
        .event-status-risco .fc-event-title,
        .event-status-risco .fc-event-time {
           color: #991b1b !important;
        }

        .event-status-aguardando {
           background-color: #fffbeb !important;
           border-left-color: #f59e0b !important;
           color: #92400e !important;
        }
        .event-status-aguardando .fc-event-main,
        .event-status-aguardando .fc-event-title,
        .event-status-aguardando .fc-event-time {
           color: #92400e !important;
        }

        .event-status-cancelado {
           background-color: #f8fafc !important;
           border-left-color: #94a3b8 !important;
           color: #475569 !important;
           opacity: 0.7;
        }
        .event-status-cancelado .fc-event-main,
        .event-status-cancelado .fc-event-title,
        .event-status-cancelado .fc-event-time {
           color: #475569 !important;
           text-decoration: line-through;
        }
      `}} />

    </div>
  );
}