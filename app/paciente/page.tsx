"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { MedsysLogo } from "@/components/Logo";
import {
  Phone, KeyRound, Loader2, Calendar, Clock, ChevronRight,
  RefreshCw, CheckCircle2, Shield, Stethoscope, Activity,
  ArrowLeft, Search, X, AlertCircle, Upload, Paperclip
} from "lucide-react";

export default function PacientePage() {
  // Steps
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone");

  // Phone & OTP
  const [telefone, setTelefone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(300);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Restore session
  useEffect(() => {
    const savedPhone = localStorage.getItem("medsys_paciente_auth");
    if (savedPhone) {
      setTelefone(savedPhone);
      setStep("dashboard");
      fetchConsultas(savedPhone);
    }
  }, []);

  // Dashboard data
  const [consultas, setConsultas] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [dashLoading, setDashLoading] = useState(false);

  // Remarcar Consulta logic
  const [remarcandoConsulta, setRemarcandoConsulta] = useState<any | null>(null);
  const [novaData, setNovaData] = useState("");
  const [novoHora, setNovoHora] = useState("");
  const [agendamentosOcupados, setAgendamentosOcupados] = useState<any[]>([]);
  const [remarcarLoading, setRemarcarLoading] = useState(false);
  const [remarcarErro, setRemarcarErro] = useState("");

  // Cancelar Consulta logic
  const [cancelandoConsulta, setCancelandoConsulta] = useState<any | null>(null);
  const [cancelarLoading, setCancelarLoading] = useState(false);

  async function handleConfirmCancelar() {
    if (!cancelandoConsulta) return;
    setCancelarLoading(true);
    
    try {
      const res = await fetch("/api/agenda/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancelar", id: cancelandoConsulta.id })
      });

      if (res.ok) {
        setCancelandoConsulta(null);
        await fetchConsultas(); // Refresh UI
      } else {
        alert("Erro ao cancelar consulta. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao cancelar:", error);
      alert("Erro de conexão.");
    } finally {
      setCancelarLoading(false);
    }
  }

  // Upload de Exames logic
  const [uploadingId, setUploadingId] = useState<string|null>(null);

  async function handleUploadExame(e: React.ChangeEvent<HTMLInputElement>, agendamentoId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(agendamentoId);
    
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const folderPath = `${telefone.replace(/\D/g, "")}/${fileName}`;

    const { error: uploadErr } = await supabase.storage
      .from('exames')
      .upload(folderPath, file, { cacheControl: '3600', upsert: false });

    if (uploadErr) {
      alert("Erro no upload do exame: " + uploadErr.message);
      setUploadingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from("agendamentos")
      .update({ anexo_path: folderPath })
      .eq("id", agendamentoId);
    
    if (!updateError) {
       await fetchConsultas(); // refresh para receber data com anexo_path atualizado
    } else {
       alert("O upload foi feito, mas ocorreu um erro ao salvar na consulta.");
    }
    setUploadingId(null);
  }

  async function openRemarcar(consulta: any) {
    setRemarcandoConsulta(consulta);
    setNovaData("");
    setNovoHora("");
    setRemarcarErro("");
    setRemarcarLoading(true);
    // Busca os horários ocupados daquele médico
    const { data } = await supabase
      .from("agendamentos")
      .select("id, data, hora, status")
      .eq("user_id", consulta.user_id)
      .neq("status", "cancelado");
    
    setAgendamentosOcupados(data || []);
    setRemarcarLoading(false);
  }

  const generateSlots = () => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
        slots.push(`${i.toString().padStart(2, "0")}:00`);
        slots.push(`${i.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const getDaySlots = () => {
    if (!novaData || !remarcandoConsulta) return [];
    
    // Filtra agendamentos do dia, ignorando a própria consulta atual
    const occupiedTimes = agendamentosOcupados
      .filter((a) => a.data === novaData && a.id !== remarcandoConsulta.id)
      .map((a) => a.hora.substring(0, 5));

    return generateSlots().map((slot) => ({
      time: slot,
      isOccupied: occupiedTimes.includes(slot),
    }));
  };

  async function handleConfirmRemarcar() {
    if (!novaData || !novoHora || !remarcandoConsulta) return;
    
    const hojeObj = new Date();
    hojeObj.setHours(0,0,0,0);
    const splitData = novaData.split("-");
    const dateE = new Date(Number(splitData[0]), Number(splitData[1]) - 1, Number(splitData[2]));
    
    if (dateE < hojeObj) {
      setRemarcarErro("A nova data precisa ser hoje ou no futuro.");
      return;
    }

    setRemarcarErro("");
    setRemarcarLoading(true);

    const res = await fetch("/api/agenda/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: remarcandoConsulta.id,
        nova_data: novaData,
        nova_hora: novoHora
      })
    });
    
    if (res.ok) {
       setRemarcandoConsulta(null);
       await fetchConsultas(); // Refresh UI
    } else {
       const err = await res.json();
       setRemarcarErro(err.error || "Ocorreu um erro ao remarcar. Tente novamente.");
    }
    setRemarcarLoading(false);
  }

  // Timer
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startTimer() {
    setOtpTimer(300);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Send OTP
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
        if (result._dev_code) {
          alert(`🔐 [MODO TESTE] Seu código: ${result._dev_code}\n\nEm produção, enviado via SMS/WhatsApp.`);
        }
        setStep("otp");
        setOtpCode(["", "", "", "", "", ""]);
        startTimer();
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(result.error || "Erro ao enviar código");
      }
    } catch {
      setOtpError("Erro de conexão.");
    }
    setOtpLoading(false);
  }

  // Verify OTP
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
        if (timerRef.current) clearInterval(timerRef.current);
        localStorage.setItem("medsys_paciente_auth", telefone);
        await fetchConsultas(telefone);
        setStep("dashboard");
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

  // Fetch appointments by phone
  async function fetchConsultas(phoneOverride?: string) {
    setDashLoading(true);
    const phoneToUse = phoneOverride || telefone;
    const cleanPhone = phoneToUse.replace(/\D/g, "");

    // Buscar por telefone — funciona para agendamentos com e sem conta
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("telefone", cleanPhone)
      .order("data", { ascending: false });

    if (!error && data) {
      setConsultas(data);

      // Buscar nomes dos médicos
      const medicoIds = [...new Set(data.map((c: any) => c.user_id))];
      if (medicoIds.length > 0) {
        const { data: docs } = await supabase
          .from("profiles")
          .select("id, nome, especialidade")
          .in("id", medicoIds);
        setMedicos(docs || []);
      }
    }
    setDashLoading(false);
  }

  // OTP input handlers
  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...otpCode];
    newCode[index] = value.slice(-1);
    setOtpCode(newCode);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
    if (value && index === 5) {
      const full = newCode.join("");
      if (full.length === 6) setTimeout(() => handleVerifyOTP(), 200);
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
    for (let i = 0; i < pasted.length && i < 6; i++) newCode[i] = pasted[i];
    setOtpCode(newCode);
    if (pasted.length === 6) setTimeout(() => handleVerifyOTP(), 200);
  }

  // Helpers
  function getMedicoNome(userId: string) {
    return medicos.find((m: any) => m.id === userId)?.nome || "Médico";
  }
  function getMedicoEsp(userId: string) {
    return medicos.find((m: any) => m.id === userId)?.especialidade || "Clínico";
  }

  const hoje = new Date().toISOString().split("T")[0];
  const proximas = consultas.filter((c: any) => c.data >= hoje && c.status !== "cancelado");
  const historico = consultas.filter((c: any) => c.data < hoje || c.status === "cancelado");

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-emerald-200">

      {/* NAVBAR */}
      <nav className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 flex items-center gap-2">
            <MedsysLogo className="h-6 sm:h-8 w-auto text-emerald-600 drop-shadow-sm" /> Medsys
          </Link>
          {step === "dashboard" && (
            <button
              onClick={() => { localStorage.removeItem("medsys_paciente_auth"); setStep("phone"); setConsultas([]); setOtpCode(["","","","","",""]); }}
              className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Sair
            </button>
          )}
        </div>
      </nav>

      {/* ===== STEP 1: PHONE ===== */}
      {step === "phone" && (
        <div className="max-w-md mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
              <Search className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              Minhas Consultas
            </h1>
            <p className="text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
              Digite seu telefone para acessar suas consultas
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 ml-1">
                <Phone className="w-4 h-4 text-emerald-600" /> Telefone / WhatsApp
              </label>
              <input
                placeholder="(11) 99999-9999"
                className="w-full px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold shadow-sm text-lg"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                required
                autoFocus
              />
            </div>

            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2">
                ⚠️ {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={otpLoading || !telefone}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white py-5 rounded-xl font-extrabold text-lg shadow-xl shadow-slate-900/20 hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              {otpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</> : <>Continuar <ChevronRight className="w-5 h-5" /></>}
            </button>

            <div className="flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-slate-300" />
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium">
                Um código de verificação será enviado para seu WhatsApp
              </p>
            </div>

            <div className="border-t border-slate-100 pt-5 text-center">
              <p className="text-sm text-slate-500 font-medium">
                Precisa agendar? <Link href="/agendamento" className="text-emerald-600 font-bold hover:underline">Ver médicos disponíveis →</Link>
              </p>
            </div>
          </form>
        </div>
      )}

      {/* ===== STEP 2: OTP ===== */}
      {step === "otp" && (
        <div className="max-w-md mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <KeyRound className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Código de Verificação</h2>
              <p className="text-sm text-slate-500 font-medium">
                Enviado para <span className="font-bold text-slate-700">{telefone}</span>
              </p>
            </div>

            {/* OTP Grid */}
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
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                  }`}
                />
              ))}
            </div>

            {/* Timer */}
            <div className="text-center">
              {otpTimer > 0 ? (
                <p className="text-sm text-slate-400">Expira em <span className="font-bold text-slate-700 font-mono">{formatTimer(otpTimer)}</span></p>
              ) : (
                <p className="text-sm text-red-500 font-bold">Código expirado</p>
              )}
            </div>

            {otpError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center">
                ⚠️ {otpError}
              </div>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading || otpCode.join("").length < 6}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-extrabold shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-60"
            >
              {otpLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : <><CheckCircle2 className="w-5 h-5" /> Verificar</>}
            </button>

            <div className="flex flex-col gap-2 items-center">
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
                  if (result.success && result._dev_code) alert(`🔐 Novo código: ${result._dev_code}`);
                  setOtpCode(["","","","","",""]); startTimer();
                  otpInputRefs.current[0]?.focus();
                  setOtpLoading(false);
                }}
                disabled={otpLoading}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reenviar código
              </button>
              <button onClick={() => { setStep("phone"); setOtpError(""); }} className="text-sm text-slate-400 hover:text-slate-700 transition-colors">
                ← Alterar telefone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== STEP 3: DASHBOARD ===== */}
      {step === "dashboard" && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16">

          {/* Welcome */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Minhas Consultas</h1>
              <p className="text-slate-500 mt-1 font-medium text-sm">
                Verificado via <span className="text-emerald-600 font-bold">{telefone}</span>
              </p>
            </div>
            <Link
              href="/agendamento"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 sm:px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 text-sm"
            >
              <Calendar className="w-4 h-4" /> <span className="hidden sm:inline">Nova Consulta</span><span className="sm:hidden">Agendar</span>
            </Link>
          </div>

          {dashLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : consultas.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
              <Activity className="w-12 h-12 text-emerald-200 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-700 mb-2">Nenhuma consulta encontrada</h2>
              <p className="text-slate-500 mb-6">Não encontramos agendamentos vinculados a este telefone.</p>
              <Link
                href="/agendamento"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold transition-all"
              >
                <Calendar className="w-4 h-4" /> Agendar agora
              </Link>
            </div>
          ) : (
            <div className="space-y-8">

              {/* PRÓXIMAS */}
              {proximas.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-slate-900">Próximas Consultas</h2>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-2 py-0.5 rounded-md">{proximas.length}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {proximas.map(c => (
                      <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500 rounded-l"></div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md tracking-wider ${
                              c.status === "confirmado" ? "bg-emerald-100 text-emerald-700" :
                              c.status === "presente" ? "bg-blue-100 text-blue-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {c.status === "pendente" ? "Aguardando confirmação" : c.status}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 mt-2 flex items-center gap-2">
                              <Stethoscope className="w-4 h-4 text-emerald-500" />
                              {getMedicoNome(c.user_id)}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium">{getMedicoEsp(c.user_id)}</p>
                            
                            {c.status === "pendente" && (
                              <div className="mt-3 flex items-start gap-1.5 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50 max-w-[280px]">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-amber-700 font-medium leading-snug">
                                  Você receberá uma mensagem para confirmar sua consulta.
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex flex-col gap-3 min-w-[200px]">
                            <div className="flex items-center gap-6 justify-between">
                              <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Data</p>
                                <p className="font-bold text-slate-800 text-sm">{c.data?.split("-").reverse().join("/")}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Hora</p>
                                <p className="font-bold text-slate-800 text-sm">{c.hora}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <button
                                 onClick={() => setCancelandoConsulta(c)}
                                 className="w-full bg-white border border-red-100 text-red-500 hover:text-red-700 hover:border-red-200 hover:bg-red-50 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                 <X className="w-3.5 h-3.5" /> Cancelar
                              </button>
                              <button
                                 onClick={() => openRemarcar(c)}
                                 className="w-full bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                 <Calendar className="w-3.5 h-3.5" /> Remarcar
                              </button>
                            </div>

                            {/* Botão de Anexos */}
                            <div className="mt-1">
                               <label className={`w-full py-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border ${
                                 uploadingId === c.id 
                                  ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                                  : c.anexo_path 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                               }`}>
                                  {uploadingId === c.id ? (
                                    <><Loader2 className="w-3 h-3 animate-spin" /> Anexando...</>
                                  ) : c.anexo_path ? (
                                    <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Exame anexado (Trocar)</>
                                  ) : (
                                    <><Upload className="w-3 h-3" /> Enviar Exame/Laudo</>
                                  )}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="application/pdf,image/png,image/jpeg" 
                                    onChange={(e) => handleUploadExame(e, c.id)}
                                    disabled={uploadingId === c.id}
                                  />
                               </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* HISTÓRICO */}
              {historico.length > 0 && (
                <section className="opacity-70">
                  <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Histórico
                  </h2>
                  <div className="flex flex-col gap-3">
                    {historico.map(c => (
                      <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-slate-700 text-sm">{getMedicoNome(c.user_id)}</h3>
                          <p className="text-slate-400 text-xs mt-0.5">{c.data?.split("-").reverse().join("/")}</p>
                        </div>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md ${
                          c.status === "cancelado" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}
      {/* MODAL REMARCAR */}
      {remarcandoConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 sm:p-8 border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" /> Remarcar
              </h3>
              <button 
                onClick={() => setRemarcandoConsulta(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
                 <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Stethoscope className="w-5 h-5 text-emerald-500" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-800">{getMedicoNome(remarcandoConsulta.user_id)}</p>
                    <p className="text-xs text-slate-500">Agendamento atual: {remarcandoConsulta.data?.split("-").reverse().join("/")} às {remarcandoConsulta.hora}</p>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Selecione a nova data:</label>
                <input 
                  type="date"
                  value={novaData}
                  onChange={(e) => {
                    setNovaData(e.target.value);
                    setNovoHora("");
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold shadow-sm"
                />
              </div>

              {novaData && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Horários disponíveis para {novaData.split("-").reverse().join("/")}:</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getDaySlots().map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => !slot.isOccupied && setNovoHora(slot.time)}
                        disabled={slot.isOccupied}
                        className={`py-2 px-1 rounded-xl text-sm font-bold text-center transition-all border
                          ${slot.isOccupied 
                            ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50" 
                            : novoHora === slot.time
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105"
                              : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 cursor-pointer"
                          }
                        `}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {remarcarErro && (
                <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {remarcarErro}
                </div>
              )}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
               <button
                 onClick={handleConfirmRemarcar}
                 disabled={!novaData || !novoHora || remarcarLoading}
                 className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white py-4 rounded-xl font-extrabold shadow-lg shadow-emerald-500/20 transition-all disabled:shadow-none disabled:transform-none transform hover:-translate-y-0.5"
               >
                 {remarcarLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar remarcação"}
               </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {cancelandoConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl p-6 sm:p-8 border border-slate-200 text-center relative overflow-hidden">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Cancelar Consulta?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta ação não poderá ser desfeita e liberará o horário de <span className="font-bold text-slate-700 whitespace-nowrap">{cancelandoConsulta.data?.split("-").reverse().join("/")}</span> com <span className="font-bold text-slate-700 whitespace-nowrap">{getMedicoNome(cancelandoConsulta.user_id)}</span>.</p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setCancelandoConsulta(null)}
                disabled={cancelarLoading}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button 
                onClick={handleConfirmCancelar}
                disabled={cancelarLoading}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-red-500/20 disabled:shadow-none disabled:opacity-70"
              >
                {cancelarLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sim, Cancelar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
