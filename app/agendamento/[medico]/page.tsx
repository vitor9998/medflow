"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { ArrowLeft, Calendar, Loader2, Hospital, Clock, Phone, Mail, FileText, User } from "lucide-react";

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
        patient_id: pacienteId 
      },
    ]);

    if (error) {
      alert(`Erro do Banco de Dados: ${error.message} \n\nDetalhes: ${JSON.stringify(error)}`);
      console.log(error);
    } else {
      alert("Consulta agendada com sucesso!");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="font-medium animate-pulse">{!pacienteId ? "Verificando Credenciais do Paciente..." : "Estabelecendo conexão segura..."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 overflow-x-hidden selection:bg-emerald-200">
      
      {/* NAVBAR SIMPLES B2C */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
           <Link href="/portal" className="flex items-center gap-1.5 sm:gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors text-sm sm:text-base">
             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Voltar
           </Link>
           <Link href="/" className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2">
             <MedsysLogo className="h-6 sm:h-8 w-auto text-emerald-600 drop-shadow-sm" /> Medsys
           </Link>
        </div>
      </nav>

      {/* HEADER DO MÉDICO */}
      <div className="w-full bg-[#020617] text-white pt-10 pb-32 sm:pt-16 sm:pb-40 px-6 relative">
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-0 right-0 p-24 opacity-20 blur-3xl rounded-full bg-emerald-500"></div>
        <div className="absolute bottom-0 left-0 p-32 opacity-10 blur-3xl rounded-full bg-teal-800"></div>

        <div className="max-w-2xl mx-auto text-center relative z-10 w-full flex flex-col items-center">
           <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-emerald-500/10 border border-emerald-500/30">
             <Hospital className="w-8 h-8 sm:w-10 sm:h-10" />
           </div>
           <h1 className="text-2xl sm:text-4xl font-extrabold mb-2 px-2 leading-tight">
             {medico.nome}
           </h1>
           <p className="text-emerald-400 text-sm sm:text-lg uppercase tracking-widest font-bold">
             {medico.especialidade || "Clínico Geral"}
           </p>
        </div>
      </div>

      {/* FORMULÁRIO SOBREPOSTO */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
        <form
          onSubmit={salvar}
          className="bg-white p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col gap-6"
        >
          <div className="border-b border-slate-100 pb-5 sm:pb-6 mb-1 sm:mb-2 text-center sm:text-left">
            <h2 className="text-xl font-extrabold text-slate-900 mb-1.5">Dados da Consulta</h2>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">Preencha com atenção. Estas informações formarão seu prontuário prévio.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                <User className="w-4 h-4 text-emerald-600" /> Paciente
              </label>
              <input
                placeholder={pacienteId ? "Preenchido automaticamente" : "Seu nome completo"}
                className={`w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium ${pacienteId ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50'}`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                readOnly={!!pacienteId}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                  <Mail className="w-4 h-4 text-emerald-600" /> Email Pessoal
                </label>
                <input
                  type="email"
                  placeholder={pacienteId ? "Preenchido automaticamente" : "voce@email.com"}
                  className={`w-full px-4 py-3.5 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium ${pacienteId ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50'}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!pacienteId}
                />
              </div>
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                  <Phone className="w-4 h-4 text-emerald-600" /> WhatsApp
                </label>
                <input
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl">
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                   <Calendar className="w-4 h-4 text-emerald-600" /> Previsão de Data
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium h-12"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                  <Clock className="w-4 h-4 text-emerald-600" /> Horários Disponíveis
                </label>
                {data ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto max-h-[140px] pr-1 pb-1">
                    {getDaySlots().map((slot) => (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={slot.isOccupied}
                        onClick={() => setHora(slot.time)}
                        className={`py-2 px-1 rounded-xl text-sm font-bold transition-all border
                          ${slot.isOccupied 
                            ? "bg-slate-100 text-slate-400 border-slate-200 opacity-50 cursor-not-allowed line-through" 
                            : hora === slot.time 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/30" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500 hover:text-emerald-700"
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex bg-white/50 border border-slate-200 border-dashed rounded-xl h-12 items-center justify-center text-slate-400 text-sm font-medium">
                    Escolha uma data primeiro.
                  </div>
                )}
                {/* Fallback hidden input to ensure required validation passes if they click a button */}
                <input type="hidden" required value={hora} />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                <FileText className="w-4 h-4 text-emerald-600" /> Triagem Inicial
              </label>
              <textarea
                placeholder="Descreva brevemente seus sintomas, quando começaram e a área da dor."
                className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[100px] sm:min-h-[120px] font-medium resize-y text-sm sm:text-base leading-relaxed"
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-4 sm:py-5 rounded-xl font-extrabold text-base sm:text-lg mt-4 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando Fila...</> : "Confirmar Agendamento"}
          </button>
          
          <p className="text-center text-[10px] sm:text-xs text-slate-400 mt-2 font-medium px-4">Ao confirmar, as diretrizes da clínica sobre tratamento de dados e uso do Medsys AI são asseguradas.</p>

        </form>
      </div>

    </div>
  );
}