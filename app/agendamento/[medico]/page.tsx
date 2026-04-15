"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { ArrowLeft, Calendar, Loader2, Hospital, Clock, Phone, Mail, FileText, User, Paperclip, X, Stethoscope, ChevronLeft, Upload, CheckCircle2, Shield } from "lucide-react";

// 🔥 PRIORIDADE
function calcularPrioridade(sintomas: string) {
  const texto = sintomas.toLowerCase();

  if (
    texto.includes("febre") ||
    texto.includes("dor forte") ||
    texto.includes("falta de ar") ||
    texto.includes("pressão no peito")
  ) {
    return "urgente";
  }

  if (
    texto.includes("dor") ||
    texto.includes("cansaço") ||
    texto.includes("tontura")
  ) {
    return "moderado";
  }

  return "leve";
}

export default function AgendamentoPage() {
  const params = useParams();
  const slug = params.medico as string;
  const router = useRouter();

  const [medico, setMedico] = useState<any>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [loading, setLoading] = useState(false);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState<any[]>([]);
  const [pacienteId, setPacienteId] = useState<string | null>(null);

  // 🔥 UPLOADER DE EXAMES
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // 🔥 buscar médico pelo slug
  useEffect(() => {
    async function initSession() {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         setPacienteId(user.id);
         setEmail(user.email || "");
         
         const { data: prof } = await supabase
           .from("profiles")
           .select("nome, telefone")
           .eq("id", user.id)
           .single();
           
         if (prof) {
            setNome(prof.nome || "");
            setTelefone(prof.telefone || "");
         }
       } else {
         // Usuário tentou acessar a url pública sem conta. Chuta pro signup
         window.location.href = "/signup";
       }
    }
    initSession();
    async function buscarMedico() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.log("Erro ao buscar médico:", error);
        return;
      }

      setMedico(data);

      // 🔥 Buscar blocos de agenda já ocupados
      const { data: agenda, error: agendaErr } = await supabase
        .from("agendamentos")
        .select("data, hora, status")
        .eq("user_id", data.id)
        .neq("status", "cancelado");
      
      if (!agendaErr && agenda) {
        setAgendamentosOcupados(agenda);
      }
    }

    buscarMedico();
  }, [slug]);

  // 🔥 GERADOR DE SLOTS (09h00 as 18h00)
  const generateSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${i.toString().padStart(2, "0")}:00`);
      slots.push(`${i.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const getDaySlots = () => {
    if (!data) return [];
    
    // Normalizar horarios do db pra "HH:mm" caso venham com segundos "HH:mm:ss"
    const occupiedTimes = agendamentosOcupados
      .filter((a) => a.data === data)
      .map((a) => a.hora.substring(0, 5));

    return generateSlots().map((slot) => ({
      time: slot,
      isOccupied: occupiedTimes.includes(slot),
    }));
  };

  async function salvar(e: any) {
    e.preventDefault();
    setLoading(true);

    if (!medico) {
      alert("Médico não encontrado");
      setLoading(false);
      return;
    }

    let anexoPath = null;

    if (arquivo) {
       setUploadStatus("Criptografando anexo no Cofre Privado...");
       const fileExt = arquivo.name.split('.').pop()?.toLowerCase() || '';
       const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
       const folderPath = `${pacienteId}/${fileName}`;

       const { data: uploadData, error: uploadErr } = await supabase.storage
         .from('exames')
         .upload(folderPath, arquivo, {
           cacheControl: '3600',
           upsert: false
         });
         
       if (uploadErr) {
         console.log(uploadErr);
         alert("O arquivo foi barrado pela segurança: " + uploadErr.message);
         setLoading(false);
         setUploadStatus("");
         return;
       }
       anexoPath = folderPath;
       setUploadStatus("");
    }

    const prioridade = calcularPrioridade(sintomas);

    const { error } = await supabase.from("agendamentos").insert([
      {
        nome,
        email,
        telefone,
        data,
        hora,
        sintomas,
        status: "pendente",
        user_id: medico.id, 
        patient_id: pacienteId,
        anexo_path: anexoPath
      },
    ]);

    if (error) {
      alert(`Erro do Banco de Dados: ${error.message} \n\nDetalhes: ${JSON.stringify(error)}`);
      console.log(error);
    } else {
      alert("Consulta solicitada com sucesso!");
      setNome("");
      setEmail("");
      setTelefone("");
      setData("");
      setHora("");
      setSintomas("");
      router.push("/portal");
    }

    setLoading(false);
  }

  // 🔥 LOADING & AUTHENTICATION GUARD
  if (!medico || !pacienteId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-slate-500 flex-col gap-5">
        <div className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200 flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
        <p className="font-bold text-slate-600 animate-pulse">{!pacienteId ? "Verificando Credenciais do Paciente..." : "Sincronizando com a agenda da clínica..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pb-24 overflow-x-hidden selection:bg-emerald-200">
      
      {/* NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
           <Link href="/agendamento" className="flex items-center gap-1.5 sm:gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors text-sm sm:text-base bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg">
             <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Voltar
           </Link>
           <Link href="/" className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2">
             <MedsysLogo className="h-6 sm:h-8 w-auto text-emerald-600 drop-shadow-sm" /> Medsys
           </Link>
        </div>
      </nav>

      {/* HEADER DO MÉDICO (Premium Profile Style) */}
      <div className="w-full bg-slate-900 text-white pt-10 pb-32 sm:pt-16 sm:pb-40 px-6 relative overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-64 h-64 opacity-20 blur-[100px] rounded-full bg-emerald-500 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 opacity-10 blur-[100px] rounded-full bg-teal-800 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5 blur-[120px] rounded-full bg-emerald-300 pointer-events-none"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10 w-full flex flex-col items-center">
           <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-900/40 ring-4 ring-white/10">
             <span className="text-3xl sm:text-4xl font-extrabold">{medico.nome?.charAt(0)}</span>
           </div>
           <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 px-2 leading-tight tracking-tight">
             {medico.nome}
           </h1>
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-emerald-400 text-sm sm:text-base font-bold shadow-sm">
             <Stethoscope className="w-4 h-4" />
             {medico.especialidade || "Clínico Geral"}
           </div>
        </div>
      </div>

      {/* FORMULÁRIO SOBREPOSTO */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
        <form
          onSubmit={salvar}
          className="bg-white p-6 sm:p-12 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col gap-8"
        >
          <div className="border-b border-slate-100 pb-6 text-center sm:text-left">
             {/* Step progress */}
             <div className="flex items-center gap-3 mb-6">
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                 <span className="text-xs font-bold text-emerald-700 hidden sm:block">Dados</span>
               </div>
               <div className="flex-1 h-0.5 bg-slate-200 rounded-full max-w-12"></div>
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center">2</div>
                 <span className="text-xs font-bold text-slate-400 hidden sm:block">Horário</span>
               </div>
               <div className="flex-1 h-0.5 bg-slate-200 rounded-full max-w-12"></div>
               <div className="flex items-center gap-2">
                 <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center">3</div>
                 <span className="text-xs font-bold text-slate-400 hidden sm:block">Confirmar</span>
               </div>
             </div>
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 mx-auto sm:mx-0">
                  <Calendar className="w-6 h-6 text-emerald-600" />
               </div>
               <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Solicitar Horário</h2>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">Confirme os detalhes para integrar à agenda do especialista.</p>
               </div>
             </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                <User className="w-4 h-4 text-emerald-600" /> Paciente
              </label>
              <input
                placeholder={pacienteId ? "Preenchido automaticamente" : "Seu nome completo"}
                className={`w-full px-5 py-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold ${pacienteId ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'bg-white shadow-sm'}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                readOnly={!!pacienteId}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <Mail className="w-4 h-4 text-emerald-600" /> Email
                </label>
                <input
                  type="email"
                  placeholder={pacienteId ? "Preenchido automaticamente" : "voce@email.com"}
                  className={`w-full px-5 py-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold ${pacienteId ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'bg-white shadow-sm'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!pacienteId}
                />
              </div>
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <Phone className="w-4 h-4 text-emerald-600" /> WhatsApp
                </label>
                <input
                  placeholder="(11) 99999-9999"
                  className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold shadow-sm"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 bg-slate-50/80 border border-slate-200 p-6 rounded-[1.5rem]">
              <div className="w-full relative">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                   <Calendar className="w-4 h-4 text-emerald-600" /> Data Desejada
                </label>
                <input
                  type="date"
                  className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold h-[54px] shadow-sm cursor-pointer"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <Clock className="w-4 h-4 text-emerald-600" /> Horários Abertos
                </label>
                {data ? (
                  <div className="space-y-3">
                    {/* Manhã */}
                    {getDaySlots().filter(s => parseInt(s.time) < 12).length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">☀️ Manhã</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {getDaySlots().filter(s => parseInt(s.time) < 12).map((slot) => (
                            <button
                              type="button"
                              key={slot.time}
                              disabled={slot.isOccupied}
                              onClick={() => setHora(slot.time)}
                              className={`py-2.5 px-1 rounded-xl text-sm font-bold transition-all border
                                ${slot.isOccupied 
                                  ? "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed line-through" 
                                  : hora === slot.time 
                                  ? "bg-slate-900 text-emerald-400 border-slate-900 shadow-md shadow-slate-900/30 scale-105 ring-2 ring-emerald-500/20" 
                                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-sm"
                                }
                              `}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {/* Tarde */}
                    {getDaySlots().filter(s => parseInt(s.time) >= 12).length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 mt-2">🌙 Tarde</p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {getDaySlots().filter(s => parseInt(s.time) >= 12).map((slot) => (
                            <button
                              type="button"
                              key={slot.time}
                              disabled={slot.isOccupied}
                              onClick={() => setHora(slot.time)}
                              className={`py-2.5 px-1 rounded-xl text-sm font-bold transition-all border
                                ${slot.isOccupied 
                                  ? "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed line-through" 
                                  : hora === slot.time 
                                  ? "bg-slate-900 text-emerald-400 border-slate-900 shadow-md shadow-slate-900/30 scale-105 ring-2 ring-emerald-500/20" 
                                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700 hover:shadow-sm"
                                }
                              `}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex bg-white border border-slate-200 border-dashed rounded-xl h-[54px] items-center justify-center text-slate-400 text-sm font-bold gap-2">
                    <Calendar className="w-4 h-4" /> Escolha a data primeiro
                  </div>
                )}
                <input type="hidden" required value={hora} />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                <FileText className="w-4 h-4 text-emerald-600" /> Queixa Inicial
              </label>
              <textarea
                placeholder="Descreva brevemente o que está sentindo, quando começou e possíveis detalhes da área afetada."
                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[120px] font-medium resize-y text-sm sm:text-base leading-relaxed mb-4 shadow-sm"
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                required
              />

              {/* MÓDULO DE ANEXOS */}
              <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl p-6 hover:bg-emerald-50/30 hover:border-emerald-300 transition-all group/upload cursor-pointer relative">
                 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover/upload:border-emerald-300 transition-colors">
                        <Upload className="w-5 h-5 text-slate-400 group-hover/upload:text-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                           Laudos ou Exames <span className="text-[10px] font-black uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">Opcional</span>
                        </p>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          Arraste ou selecione — Até 5MB • PDF, JPG, PNG
                        </p>
                      </div>
                    </div>
                    {arquivo ? (
                       <div className="flex bg-white items-center gap-3 text-sm font-bold text-slate-700 border border-emerald-200 px-4 py-2.5 rounded-xl shadow-sm w-full sm:w-auto overflow-hidden ring-2 ring-emerald-500/10">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> 
                          <span className="truncate max-w-[150px]">{arquivo.name}</span>
                          <button type="button" onClick={() => setArquivo(null)} className="ml-auto hover:text-white hover:bg-red-500 bg-slate-100 rounded-full p-1 transition-colors">
                            <X className="w-4 h-4"/>
                          </button>
                       </div>
                    ) : (
                       <div className="w-full sm:w-auto">
                         <label className="cursor-pointer bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 text-slate-700 text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full">
                           <Paperclip className="w-4 h-4" />
                           Selecionar arquivo
                           <input 
                             type="file" 
                             className="hidden" 
                             accept="image/png, image/jpeg, application/pdf"
                             onChange={(e) => {
                               if (e.target.files && e.target.files.length > 0) {
                                  const file = e.target.files[0];
                                  if (file.size > 5 * 1024 * 1024) {
                                     alert("O arquivo ultrapassa o limite máximo de 5MB!");
                                     return;
                                  }
                                  setArquivo(file);
                               }
                             }}
                           />
                         </label>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white py-5 rounded-[1rem] font-extrabold text-lg mt-2 shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {uploadStatus || "Sincronizando Agenda..."}</> : <><CheckCircle2 className="w-5 h-5" /> Confirmar Solicitação</>}
          </button>
          
          <div className="flex items-center justify-center gap-2 mt-1">
            <Shield className="w-3.5 h-3.5 text-slate-300" />
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
              Dados criptografados e protegidos conforme LGPD
            </p>
          </div>

        </form>
      </div>

    </div>
  );
}