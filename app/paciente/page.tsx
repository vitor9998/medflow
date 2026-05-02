"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { normalizePhone } from "@/lib/utils/phone";
import { ZyntraLogo } from "@/components/Logo";
import { Playfair_Display, Inter } from "next/font/google";
import {
  Phone, KeyRound, Loader2, Calendar, Clock, ChevronRight,
  RefreshCw, CheckCircle2, ShieldCheck, Stethoscope, Activity,
  ChevronLeft, Search, X, AlertCircle, Upload
} from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function PacienteEditorial() {
  const [step, setStep] = useState<"phone" | "otp" | "dashboard">("phone");

  const [telefone, setTelefone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpTimer, setOtpTimer] = useState(300);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const savedPhone = localStorage.getItem("medsys_paciente_auth");
    if (savedPhone) {
      setTelefone(savedPhone);
      setStep("dashboard");
      fetchConsultas(savedPhone);
    }
  }, []);

  const [consultas, setConsultas] = useState<any[]>([]);
  const [medicos, setMedicos] = useState<any[]>([]);
  const [dashLoading, setDashLoading] = useState(false);

  const [remarcandoConsulta, setRemarcandoConsulta] = useState<any | null>(null);
  const [novaData, setNovaData] = useState("");
  const [novoHora, setNovoHora] = useState("");
  const [agendamentosOcupados, setAgendamentosOcupados] = useState<any[]>([]);
  const [remarcarLoading, setRemarcarLoading] = useState(false);
  const [remarcarErro, setRemarcarErro] = useState("");

  const [cancelandoConsulta, setCancelandoConsulta] = useState<any | null>(null);
  const [cancelarLoading, setCancelarLoading] = useState(false);

  const [uploadingId, setUploadingId] = useState<string|null>(null);

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
        await fetchConsultas();
      } else {
        alert("Erro ao cancelar consulta. Tente novamente.");
      }
    } catch (error) {
      alert("Erro de conexão.");
    } finally {
      setCancelarLoading(false);
    }
  }

  async function handleUploadExame(e: React.ChangeEvent<HTMLInputElement>, agendamentoId: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(agendamentoId);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const folderPath = `${normalizePhone(telefone)}/${fileName}`;

    const { error: uploadErr } = await supabase.storage.from('exames').upload(folderPath, file, { cacheControl: '3600', upsert: false });
    if (uploadErr) {
      alert("Erro no upload do exame: " + uploadErr.message);
      setUploadingId(null);
      return;
    }

    const { error: updateError } = await supabase.from("agendamentos").update({ anexo_path: folderPath }).eq("id", agendamentoId);
    if (!updateError) {
       await fetchConsultas();
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
    const { data } = await supabase.from("agendamentos").select("id, data, hora, status").eq("user_id", consulta.user_id).neq("status", "cancelado");
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
    const occupiedTimes = agendamentosOcupados.filter((a: any) => a.data === novaData && a.id !== remarcandoConsulta.id).map((a: any) => a.hora.substring(0, 5));
    return generateSlots().map((slot: any) => ({ time: slot, isOccupied: occupiedTimes.includes(slot) }));
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
      body: JSON.stringify({ id: remarcandoConsulta.id, nova_data: novaData, nova_hora: novoHora })
    });
    
    if (res.ok) {
       setRemarcandoConsulta(null);
       await fetchConsultas();
    } else {
       const err = await res.json();
       setRemarcarErro(err.error || "Erro ao remarcar.");
    }
    setRemarcarLoading(false);
  }

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
        if (result._dev_code) alert(`🔐 [MODO TESTE] Seu código: ${result._dev_code}`);
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

  async function fetchConsultas(phoneOverride?: string) {
    setDashLoading(true);
    const phoneToUse = phoneOverride || telefone;
    const cleanPhone = normalizePhone(phoneToUse);
    const { data, error } = await supabase.from("agendamentos").select("*").eq("telefone", cleanPhone).order("data", { ascending: false });

    if (!error && data) {
      setConsultas(data);
      const medicoIds = [...new Set(data.map((c: any) => c.user_id))];
      if (medicoIds.length > 0) {
        const { data: docs } = await supabase.from("profiles").select("id, nome, especialidade").in("id", medicoIds);
        setMedicos(docs || []);
      }
    }
    setDashLoading(false);
  }

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

  function getMedicoNome(userId: string) {
    const nome = medicos.find((m: any) => m.id === userId)?.nome || "Médico";
    return nome.startsWith('Dr') ? nome : `Dr. ${nome}`;
  }
  function getMedicoEsp(userId: string) {
    return medicos.find((m: any) => m.id === userId)?.especialidade || "Especialista";
  }

  const hoje = new Date().toISOString().split("T")[0];
  const proximas = consultas.filter((c: any) => c.data >= hoje && c.status !== "cancelado");
  const historico = consultas.filter((c: any) => c.data < hoje || c.status === "cancelado");

  return (
    <div className={`min-h-screen bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50`}>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-[#FDFCF8]/90 backdrop-blur-md border-b border-stone-200/50 px-6 py-5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <Link href="/" className="group flex items-center gap-3 hover:opacity-70 transition-opacity">
             <ZyntraLogo className="h-6 w-auto text-emerald-900" /> 
           </Link>
           {step === "dashboard" ? (
             <button
               onClick={() => { localStorage.removeItem("medsys_paciente_auth"); setStep("phone"); setConsultas([]); setOtpCode(["","","","","",""]); }}
               className="text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity text-stone-500"
             >
               Sair do Portal
             </button>
           ) : (
             <Link href="/" className="text-xs tracking-widest uppercase font-semibold flex items-center gap-2 hover:opacity-70 transition-opacity text-stone-500">
                <ChevronLeft className="w-4 h-4" /> Voltar
             </Link>
           )}
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-6 pt-40 pb-32 w-full relative">
        
        {/* STEP 1: PHONE */}
        {step === "phone" && (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-12">
               <h1 className={`${playfair.className} text-5xl font-semibold text-stone-900 leading-[1.05] tracking-tight mb-4`}>
                 O seu <span className="italic text-emerald-900">dossiê de saúde</span>.
               </h1>
               <p className="text-lg text-stone-500 font-light max-w-md mx-auto leading-relaxed">
                 Acesse seus agendamentos e histórico médico utilizando o seu número de telefone.
               </p>
            </div>

            <form onSubmit={handleSendOTP} className="w-full max-w-md bg-white border border-stone-200 p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="mb-8">
                <label className="text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 block">
                  Telefone ou WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-stone-400" />
                  </div>
                  <input
                    placeholder="(11) 99999-9999"
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-stone-200 bg-[#FDFCF8] focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 outline-none transition-all text-stone-800 font-light placeholder-stone-400"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              {otpError && (
                <div className="bg-red-50 text-red-700 text-xs uppercase tracking-widest font-semibold p-4 rounded-xl mb-6 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {otpError}
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || !telefone}
                className="w-full flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
              >
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Solicitar acesso"}
              </button>

              <div className="mt-8 pt-8 border-t border-stone-100 text-center">
                 <Link href="/agendamento" className="text-xs tracking-widest uppercase font-semibold text-stone-500 hover:text-emerald-900 transition-colors">
                   Não tem consulta? Agende agora →
                 </Link>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <div className="w-full flex flex-col items-center">
            <div className="text-center mb-12">
               <h1 className={`${playfair.className} text-4xl font-semibold text-stone-900 leading-[1.05] tracking-tight mb-4`}>
                 Confirme sua <span className="italic text-emerald-900">identidade</span>.
               </h1>
               <p className="text-stone-500 font-light max-w-sm mx-auto leading-relaxed">
                 Insira o código enviado para <br/><span className="font-semibold text-stone-800">{telefone}</span>
               </p>
            </div>

            <div className="w-full max-w-md bg-white border border-stone-200 p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <div className="flex justify-center gap-2 mb-8" onPaste={handleOtpPaste}>
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
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-light rounded-xl border transition-all outline-none ${
                      digit
                        ? "border-emerald-900 bg-[#FDFCF8] text-emerald-900"
                        : "border-stone-200 bg-white text-stone-900 focus:border-emerald-900"
                    }`}
                  />
                ))}
              </div>

              <div className="text-center mb-8">
                {otpTimer > 0 ? (
                  <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold">Expira em {formatTimer(otpTimer)}</p>
                ) : (
                  <p className="text-xs uppercase tracking-widest text-red-500 font-semibold">Código expirado</p>
                )}
              </div>

              {otpError && (
                <div className="bg-red-50 text-red-700 text-xs uppercase tracking-widest font-semibold p-4 rounded-xl mb-6 flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4" /> {otpError}
                </div>
              )}

              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otpCode.join("").length < 6}
                className="w-full flex items-center justify-center gap-2 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
              >
                {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Validar código"}
              </button>

              <div className="mt-8 pt-8 border-t border-stone-100 flex flex-col items-center gap-4">
                <button
                  onClick={async () => {
                    setOtpError(""); setOtpLoading(true);
                    const res = await fetch("/api/otp/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ telefone }) });
                    const result = await res.json();
                    if (result.success && result._dev_code) alert(`🔐 Novo código: ${result._dev_code}`);
                    setOtpCode(["","","","","",""]); startTimer(); otpInputRefs.current[0]?.focus(); setOtpLoading(false);
                  }}
                  disabled={otpLoading}
                  className="text-xs tracking-widest uppercase font-semibold text-stone-500 hover:text-emerald-900 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reenviar código
                </button>
                <button onClick={() => { setStep("phone"); setOtpError(""); }} className="text-xs tracking-widest uppercase font-semibold text-stone-400 hover:text-stone-600 transition-colors">
                  Alterar telefone
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DASHBOARD */}
        {step === "dashboard" && (
          <div className="w-full">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6">
              <div>
                <h1 className={`${playfair.className} text-4xl text-stone-900 mb-2`}>Seus Agendamentos</h1>
                <p className="text-xs uppercase tracking-widest font-semibold text-stone-400">
                  Acesso via {telefone}
                </p>
              </div>
              <Link
                href="/agendamento"
                className="flex items-center gap-2 bg-[#FDFCF8] hover:bg-stone-50 text-stone-800 border border-stone-200 px-6 py-3 rounded-full font-medium transition-all text-sm uppercase tracking-widest"
              >
                <Calendar className="w-4 h-4" /> Marcar nova
              </Link>
            </div>

            {dashLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-900 stroke-[1.5px]" />
              </div>
            ) : consultas.length === 0 ? (
              <div className="text-center py-24 bg-white border border-stone-200 rounded-2xl">
                <div className={`${playfair.className} text-6xl italic text-stone-200 mb-6`}>?</div>
                <h3 className={`${playfair.className} text-2xl text-stone-900 mb-4`}>Nenhum registro encontrado</h3>
                <p className="text-stone-500 font-light mb-8 max-w-sm mx-auto">Você não possui agendamentos vinculados a este número.</p>
                <Link
                  href="/agendamento"
                  className="inline-flex items-center gap-2 bg-emerald-900 text-white px-8 py-4 rounded-full font-medium transition-all hover:bg-emerald-800"
                >
                  Procurar especialistas
                </Link>
              </div>
            ) : (
              <div className="space-y-16">
                
                {/* PRÓXIMAS CONSULTAS */}
                {proximas.length > 0 && (
                  <section>
                    <h2 className="text-xs tracking-widest uppercase font-semibold text-emerald-900 mb-6 border-b border-stone-200 pb-4 flex items-center justify-between">
                      Consultas Vigentes
                      <span className="bg-emerald-900/5 px-2 py-1 rounded text-emerald-900">{proximas.length}</span>
                    </h2>
                    
                    <div className="grid gap-6">
                      {proximas.map((c: any) => (
                        <div key={c.id} className="bg-white border border-stone-200 p-8 rounded-2xl flex flex-col md:flex-row gap-8 justify-between items-start md:items-center hover:border-emerald-900/20 transition-all">
                          
                          <div className="flex-1">
                            <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded tracking-widest inline-block mb-4 ${
                              c.status === "confirmado" ? "bg-emerald-900/10 text-emerald-900" :
                              c.status === "presente" ? "bg-stone-100 text-stone-600" :
                              "bg-amber-100/50 text-amber-700"
                            }`}>
                              {c.status === "pendente" ? "Aguardando confirmação" : c.status}
                            </span>
                            <h3 className={`${playfair.className} text-2xl text-stone-900 mb-1`}>
                              {getMedicoNome(c.user_id)}
                            </h3>
                            <p className="text-stone-500 text-sm tracking-widest uppercase font-semibold mb-4">
                              {getMedicoEsp(c.user_id)}
                            </p>

                            {c.status === "pendente" && (
                              <p className="text-xs text-stone-500 font-light italic">
                                Você receberá um WhatsApp para confirmar sua presença.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col gap-4 w-full md:w-auto">
                            <div className="bg-[#FDFCF8] border border-stone-100 p-4 rounded-xl flex gap-8 items-center min-w-[220px] justify-center">
                               <div className="text-center">
                                  <span className="block text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-1">Data</span>
                                  <span className="font-medium text-stone-900">{c.data?.split("-").reverse().join("/")}</span>
                               </div>
                               <div className="w-px h-8 bg-stone-200"></div>
                               <div className="text-center">
                                  <span className="block text-[10px] tracking-widest uppercase font-bold text-stone-400 mb-1">Hora</span>
                                  <span className="font-medium text-stone-900">{c.hora}</span>
                               </div>
                            </div>

                            <div className="flex gap-2">
                               <button onClick={() => setCancelandoConsulta(c)} className="flex-1 text-[11px] tracking-widest uppercase font-semibold text-stone-500 border border-stone-200 py-3 rounded-xl hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors">
                                  Cancelar
                               </button>
                               <button onClick={() => openRemarcar(c)} className="flex-1 text-[11px] tracking-widest uppercase font-semibold text-emerald-900 border border-emerald-900/20 bg-emerald-900/5 py-3 rounded-xl hover:bg-emerald-900 hover:text-white transition-colors">
                                  Remarcar
                               </button>
                            </div>

                            {/* Anexos */}
                            <label className={`w-full text-center py-3 rounded-xl text-[11px] tracking-widest uppercase font-semibold transition-colors border cursor-pointer ${
                              uploadingId === c.id ? 'bg-stone-100 text-stone-400 border-stone-200' :
                              c.anexo_path ? 'bg-[#FDFCF8] text-emerald-900 border-emerald-900/20' : 'bg-white text-stone-500 border-stone-200 hover:bg-[#FDFCF8]'
                            }`}>
                               {uploadingId === c.id ? 'Enviando...' : c.anexo_path ? 'Exame Anexado (Trocar)' : 'Anexar Exame/Laudo'}
                               <input type="file" className="hidden" accept="application/pdf,image/png,image/jpeg" onChange={(e) => handleUploadExame(e, c.id)} disabled={uploadingId === c.id} />
                            </label>
                          </div>

                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* HISTÓRICO */}
                {historico.length > 0 && (
                  <section>
                    <h2 className="text-xs tracking-widest uppercase font-semibold text-stone-400 mb-6 border-b border-stone-100 pb-4">
                      Histórico
                    </h2>
                    <div className="grid gap-3 opacity-70">
                      {historico.map((c: any) => (
                        <div key={c.id} className="bg-transparent border border-stone-200 p-4 rounded-xl flex items-center justify-between hover:bg-white transition-colors">
                          <div>
                            <h3 className="font-medium text-stone-900 text-sm">{getMedicoNome(c.user_id)}</h3>
                            <p className="text-stone-400 text-xs font-light mt-1">{c.data?.split("-").reverse().join("/")} • {c.hora}</p>
                          </div>
                          <span className="text-[10px] tracking-widest uppercase font-semibold text-stone-400 bg-stone-100 px-2 py-1 rounded">
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

      </main>

      {/* MODAL REMARCAR */}
      {remarcandoConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-[#FDFCF8] rounded-2xl w-full max-w-md shadow-2xl p-8 border border-stone-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <h3 className={`${playfair.className} text-2xl text-stone-900`}>Remarcar Consulta</h3>
              <button onClick={() => setRemarcandoConsulta(null)} className="text-stone-400 hover:text-stone-900 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <div className="bg-white border border-stone-200 p-4 rounded-xl">
                 <p className="text-sm font-semibold text-stone-900">{getMedicoNome(remarcandoConsulta.user_id)}</p>
                 <p className="text-xs text-stone-500 font-light mt-1">Atual: {remarcandoConsulta.data?.split("-").reverse().join("/")} às {remarcandoConsulta.hora}</p>
              </div>

              <div>
                <label className="text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 block">Nova Data</label>
                <input 
                  type="date"
                  value={novaData}
                  onChange={(e) => { setNovaData(e.target.value); setNovoHora(""); }}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-1 focus:ring-emerald-900 outline-none text-stone-800 font-light"
                />
              </div>

              {novaData && (
                <div>
                  <label className="text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 block">Horários</label>
                  <div className="grid grid-cols-4 gap-2">
                    {getDaySlots().map((slot: any) => (
                      <button
                        key={slot.time}
                        onClick={() => !slot.isOccupied && setNovoHora(slot.time)}
                        disabled={slot.isOccupied}
                        className={`py-2 rounded-lg text-sm transition-all border ${
                          slot.isOccupied ? "bg-stone-100 text-stone-400 border-transparent cursor-not-allowed" :
                          novoHora === slot.time ? "bg-emerald-900 text-white border-emerald-900 font-medium" :
                          "bg-white text-stone-700 border-stone-200 hover:border-emerald-900/30"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {remarcarErro && (
                <div className="bg-red-50 text-red-700 text-xs tracking-widest uppercase font-semibold p-3 rounded-xl border border-red-100">
                  {remarcarErro}
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-stone-200">
               <button
                 onClick={handleConfirmRemarcar}
                 disabled={!novaData || !novoHora || remarcarLoading}
                 className="w-full flex items-center justify-center bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white py-4 rounded-xl font-medium transition-all"
               >
                 {remarcarLoading ? "Processando..." : "Confirmar nova data"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CANCELAR */}
      {cancelandoConsulta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/40 backdrop-blur-sm">
          <div className="bg-[#FDFCF8] rounded-2xl w-full max-w-sm shadow-2xl p-8 border border-stone-200 text-center">
            <h3 className={`${playfair.className} text-2xl text-stone-900 mb-4`}>Cancelar Consulta?</h3>
            <p className="text-sm text-stone-500 font-light mb-8">
              O horário de <span className="font-semibold text-stone-800">{cancelandoConsulta.data?.split("-").reverse().join("/")}</span> será liberado.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmCancelar}
                disabled={cancelarLoading}
                className="w-full py-4 rounded-xl font-medium text-white bg-red-700 hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {cancelarLoading ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
              <button 
                onClick={() => setCancelandoConsulta(null)}
                disabled={cancelarLoading}
                className="w-full py-4 rounded-xl font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Manter consulta
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
