"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { ArrowLeft, Calendar, Loader2, Hospital, Clock, Phone, Mail, FileText, User, Paperclip, X, Stethoscope, ChevronLeft, Upload, CheckCircle2, Shield, KeyRound, RefreshCw } from "lucide-react";

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
  const [observacoesPaciente, setObservacoesPaciente] = useState("");
  const [loading, setLoading] = useState(false);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState<any[]>([]);
  const [pacienteId, setPacienteId] = useState<string | null>(null);

  // 🔥 UPLOADER DE EXAMES
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // 🔐 OTP States
  const [step, setStep] = useState<"identity" | "otp" | "schedule">("identity");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(300); // 5 min in seconds
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 🔥 buscar médico pelo slug + check auth
  useEffect(() => {
    async function initSession() {
       const { data: { user } } = await supabase.auth.getUser();
       if (user) {
         setPacienteId(user.id);
         setEmail(user.email || "");
         setIsLoggedIn(true);
         setStep("schedule"); // Logado → pula direto pro agendamento
         
         const { data: prof } = await supabase
           .from("profiles")
           .select("nome, telefone")
           .eq("id", user.id)
           .single();
           
         if (prof) {
            setNome(prof.nome || "");
            setTelefone(prof.telefone || "");
         }
       }
       // Não redireciona mais — permite acesso sem login
       setPageLoading(false);
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

  // OTP countdown timer
  useEffect(() => {
    if (step !== "otp" || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

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
    
    const occupiedTimes = agendamentosOcupados
      .filter((a) => a.data === data)
      .map((a) => a.hora.substring(0, 5));

    return generateSlots().map((slot) => ({
      time: slot,
      isOccupied: occupiedTimes.includes(slot),
    }));
  };

  // 🔐 STEP 1: Enviar OTP
  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/otp/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone }),
      });

      const result = await res.json();

      if (result.success) {
        // MVP: Mostra o código para teste
        if (result._dev_code) {
          alert(`🔐 [MODO TESTE] Seu código de verificação é: ${result._dev_code}\n\nEm produção, este código será enviado por SMS/WhatsApp.`);
        }
        setStep("otp");
        setOtpTimer(300);
        setOtpCode(["", "", "", "", "", ""]);
        // Focus first input after render
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(result.error || "Erro ao enviar código");
      }
    } catch {
      setOtpError("Erro de conexão. Tente novamente.");
    }

    setOtpLoading(false);
  }

  // 🔐 STEP 2: Verificar OTP
  async function handleVerifyOTP() {
    const code = otpCode.join("");
    if (code.length < 6) return;

    setOtpLoading(true);
    setOtpError("");

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefone, code }),
      });

      const result = await res.json();

      if (result.valid) {
        setStep("schedule");
      } else {
        setOtpError(result.reason || "Código inválido");
        setOtpCode(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      }
    } catch {
      setOtpError("Erro de conexão");
    }

    setOtpLoading(false);
  }

  // OTP input handling
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return; // Only digits

    const newCode = [...otpCode];
    newCode[index] = value.slice(-1); // Only last char
    setOtpCode(newCode);

    // Auto-advance
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (value && index === 5) {
      const full = newCode.join("");
      if (full.length === 6) {
        setTimeout(() => handleVerifyOTP(), 200);
      }
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;
    const newCode = [...otpCode];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newCode[i] = pasted[i];
    }
    setOtpCode(newCode);
    if (pasted.length === 6) {
      setTimeout(() => handleVerifyOTP(), 200);
    }
  }

  // Format timer
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
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
       const folderPath = `${pacienteId || "otp-guest"}/${fileName}`;

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
        observacoes_paciente: observacoesPaciente || null,
        status: "pendente",
        user_id: medico.id, 
        patient_id: pacienteId, // null para OTP guests
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
      setObservacoesPaciente("");
      if (isLoggedIn) {
        router.push("/paciente");
      } else {
        router.push("/agendamento");
      }
    }

    setLoading(false);
  }

  // Step indicator value
  const activeStep = step === "identity" ? 1 : step === "otp" ? 2 : 3;

  // 🔥 LOADING
  if (pageLoading || !medico) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] text-slate-500 flex-col gap-5">
        <div className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200 flex items-center justify-center">
           <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
        <p className="font-bold text-slate-600 animate-pulse">Sincronizando com a agenda da clínica...</p>
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

      {/* HEADER DO MÉDICO */}
      <div className="w-full bg-slate-900 text-white pt-10 pb-32 sm:pt-16 sm:pb-40 px-6 relative overflow-hidden">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-64 h-64 opacity-20 blur-[100px] rounded-full bg-emerald-500 pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/4 w-80 h-80 opacity-10 blur-[100px] rounded-full bg-teal-800 pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5 blur-[120px] rounded-full bg-emerald-300 pointer-events-none"></div>
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

      {/* FORM */}
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-28 relative z-10">
        <div className="bg-white p-6 sm:p-12 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 flex flex-col gap-8">
          
          {/* Step Progress — Agora funcional */}
          <div className="border-b border-slate-100 pb-6">
             <div className="flex items-center gap-3 mb-6">
               <div className="flex items-center gap-2">
                 <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${activeStep >= 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>1</div>
                 <span className={`text-xs font-bold hidden sm:block ${activeStep >= 1 ? "text-emerald-700" : "text-slate-400"}`}>Identidade</span>
               </div>
               <div className={`flex-1 h-0.5 rounded-full max-w-12 transition-colors ${activeStep >= 2 ? "bg-emerald-500" : "bg-slate-200"}`}></div>
               <div className="flex items-center gap-2">
                 <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${activeStep >= 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>2</div>
                 <span className={`text-xs font-bold hidden sm:block ${activeStep >= 2 ? "text-emerald-700" : "text-slate-400"}`}>Verificação</span>
               </div>
               <div className={`flex-1 h-0.5 rounded-full max-w-12 transition-colors ${activeStep >= 3 ? "bg-emerald-500" : "bg-slate-200"}`}></div>
               <div className="flex items-center gap-2">
                 <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${activeStep >= 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>3</div>
                 <span className={`text-xs font-bold hidden sm:block ${activeStep >= 3 ? "text-emerald-700" : "text-slate-400"}`}>Agendar</span>
               </div>
             </div>

             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 mx-auto sm:mx-0">
                  {step === "identity" && <User className="w-6 h-6 text-emerald-600" />}
                  {step === "otp" && <KeyRound className="w-6 h-6 text-emerald-600" />}
                  {step === "schedule" && <Calendar className="w-6 h-6 text-emerald-600" />}
               </div>
               <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                    {step === "identity" && "Confirme sua Identidade"}
                    {step === "otp" && "Código de Verificação"}
                    {step === "schedule" && "Solicitar Horário"}
                  </h2>
                  <p className="text-slate-500 font-medium text-sm sm:text-base">
                    {step === "identity" && "Informe seus dados para receber o código de verificação."}
                    {step === "otp" && "Digite o código de 6 dígitos enviado para seu telefone."}
                    {step === "schedule" && "Confirme os detalhes para integrar à agenda do especialista."}
                  </p>
               </div>
             </div>
          </div>

          {/* ===== STEP 1: IDENTITY ===== */}
          {step === "identity" && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <User className="w-4 h-4 text-emerald-600" /> Nome Completo
                </label>
                <input
                  placeholder="Seu nome completo"
                  className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold shadow-sm"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                    <Phone className="w-4 h-4 text-emerald-600" /> WhatsApp / Telefone
                  </label>
                  <input
                    placeholder="(11) 99999-9999"
                    className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold shadow-sm"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                  />
                </div>
                <div className="w-full">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                    <Mail className="w-4 h-4 text-emerald-600" /> Email <span className="text-slate-400 font-medium text-xs">(opcional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold shadow-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <span>⚠️</span> {otpError}
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || !nome || !telefone}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white py-5 rounded-[1rem] font-extrabold text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {otpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando código...</> : <>Continuar <ArrowLeft className="w-5 h-5 rotate-180" /></>}
              </button>

              <div className="flex items-center justify-center gap-2 mt-1">
                <Shield className="w-3.5 h-3.5 text-slate-300" />
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                  Um código de verificação será enviado para seu WhatsApp
                </p>
              </div>
            </form>
          )}

          {/* ===== STEP 2: OTP VERIFICATION ===== */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <KeyRound className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Código enviado para <span className="font-bold text-slate-700">{telefone}</span>
                </p>
              </div>

              {/* OTP Input Grid */}
              <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpInputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-extrabold rounded-xl border-2 transition-all outline-none ${
                      digit
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    }`}
                  />
                ))}
              </div>

              {/* Timer */}
              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-slate-400 font-medium">
                    Código expira em <span className="font-bold text-slate-700 font-mono">{formatTimer(otpTimer)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-red-500 font-bold">Código expirado</p>
                )}
              </div>

              {otpError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center">
                  <span>⚠️</span> {otpError}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={otpLoading || otpCode.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-extrabold text-base shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {otpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : <><CheckCircle2 className="w-5 h-5" /> Verificar Código</>}
                </button>

                <button
                  onClick={async () => {
                    setOtpError("");
                    setOtpLoading(true);
                    const res = await fetch("/api/otp/generate", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ telefone }),
                    });
                    const result = await res.json();
                    if (result.success && result._dev_code) {
                      alert(`🔐 [MODO TESTE] Novo código: ${result._dev_code}`);
                    }
                    setOtpTimer(300);
                    setOtpCode(["", "", "", "", "", ""]);
                    otpInputRefs.current[0]?.focus();
                    setOtpLoading(false);
                  }}
                  disabled={otpLoading}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold text-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Reenviar código
                </button>

                <button
                  onClick={() => { setStep("identity"); setOtpError(""); }}
                  className="text-sm text-slate-400 hover:text-slate-700 font-medium transition-colors"
                >
                  ← Alterar telefone
                </button>
              </div>
            </div>
          )}

          {/* ===== STEP 3: SCHEDULE (formulário original) ===== */}
          {step === "schedule" && (
            <form onSubmit={salvar} className="space-y-6">

              {/* Dados do paciente (readonly se logado, editável se OTP) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <User className="w-4 h-4 text-emerald-600" /> Paciente
                </label>
                <input
                  placeholder="Seu nome completo"
                  className={`w-full px-5 py-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold ${(isLoggedIn || !isLoggedIn) ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'bg-white shadow-sm'}`}
                  value={nome}
                  readOnly
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                    <Mail className="w-4 h-4 text-emerald-600" /> Email
                  </label>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    className={`w-full px-5 py-4 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold ${isLoggedIn ? 'bg-slate-50 cursor-not-allowed opacity-80' : 'bg-white shadow-sm'}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={isLoggedIn}
                  />
                </div>
                <div className="w-full">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                    <Phone className="w-4 h-4 text-emerald-600" /> WhatsApp
                  </label>
                  <input
                    placeholder="(11) 99999-9999"
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 cursor-not-allowed opacity-80 border border-slate-200 text-slate-900 placeholder-slate-400 transition-all font-bold"
                    value={telefone}
                    readOnly
                    required
                  />
                </div>
              </div>

              {/* Verificado badge */}
              {!isLoggedIn && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-bold text-emerald-700">Identidade verificada via OTP</p>
                </div>
              )}

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
                  <FileText className="w-4 h-4 text-emerald-600" /> Motivo da consulta
                </label>
                <textarea
                  placeholder="Descreva brevemente o motivo da sua consulta e quando os sintomas comecaram."
                  className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all min-h-[100px] font-medium resize-y text-sm sm:text-base leading-relaxed shadow-sm"
                  value={sintomas}
                  onChange={(e) => setSintomas(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                  <Stethoscope className="w-4 h-4 text-slate-400" /> Observacoes adicionais <span className="text-[10px] font-black uppercase bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md ml-1">Opcional</span>
                </label>
                <textarea
                  placeholder="Medicamentos em uso, alergias, cirurgias anteriores ou qualquer informacao relevante para o medico."
                  className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-500/10 focus:border-slate-300 transition-all min-h-[80px] font-medium resize-y text-sm leading-relaxed mb-4 shadow-sm"
                  value={observacoesPaciente}
                  onChange={(e) => setObservacoesPaciente(e.target.value)}
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
          )}

        </div>
      </div>

    </div>
  );
}