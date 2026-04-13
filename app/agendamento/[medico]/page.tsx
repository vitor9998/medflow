"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  const [medico, setMedico] = useState<any>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 buscar médico pelo slug
  useEffect(() => {
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
    }

    buscarMedico();
  }, [slug]);

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
        prioridade,
        user_id: medico.id, // 🔥 VINCULA AO MÉDICO CERTO
      },
    ]);

    if (error) {
      alert("Erro ao salvar");
      console.log(error);
    } else {
      alert("Consulta agendada com sucesso!");
      setNome("");
      setEmail("");
      setTelefone("");
      setData("");
      setHora("");
      setSintomas("");
    }

    setLoading(false);
  }

  // 🔥 LOADING
  if (!medico) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <p className="font-medium animate-pulse">Estabelecendo conexão segura...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      {/* NAVBAR SIMPLES B2C */}
      <nav className="w-full bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link href="/agendamento" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
             <ArrowLeft className="w-5 h-5" /> Voltar
           </Link>
           <Link href="/" className="font-bold text-xl tracking-tight text-slate-900 flex items-center gap-2">
             <MedsysLogo className="h-8 w-auto text-emerald-600" /> Medsys
           </Link>
        </div>
      </nav>

      {/* HEADER DO MÉDICO */}
      <div className="w-full bg-[#020617] text-white pt-16 pb-32">
        <div className="max-w-2xl mx-auto px-6 text-center">
           <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10 border border-emerald-500/30">
             <Hospital className="w-10 h-10" />
           </div>
           <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
             {medico.nome}
           </h1>
           <p className="text-slate-400 text-lg uppercase tracking-wider font-semibold">
             {medico.especialidade || "Clínico Geral"}
           </p>
        </div>
      </div>

      {/* FORMULÁRIO SOBREPOSTO */}
      <div className="max-w-2xl mx-auto px-6 -mt-20 relative z-10">
        <form
          onSubmit={salvar}
          className="bg-white p-6 sm:p-10 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col gap-6"
        >
          <div className="border-b border-slate-100 pb-6 mb-2">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Dados da Consulta</h2>
            <p className="text-slate-500 text-sm">Preencha com atenção. Estas informações formarão seu prontuário prévio.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                <User className="w-4 h-4 text-emerald-600" /> Paciente
              </label>
              <input
                placeholder="Seu nome completo"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <div className="w-full">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                  <Mail className="w-4 h-4 text-emerald-600" /> Email Pessoal
                </label>
                <input
                  type="email"
                  placeholder="voce@email.com"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                  <Clock className="w-4 h-4 text-emerald-600" /> Previsão de Horário
                </label>
                <input
                  type="time"
                  className="w-full px-4 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium h-12"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                <FileText className="w-4 h-4 text-emerald-600" /> Triagem Inicial
              </label>
              <textarea
                placeholder="Descreva brevemente seus sintomas, quando começaram e a área da dor."
                className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all min-h-[120px] font-medium resize-y"
                value={sintomas}
                onChange={(e) => setSintomas(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-xl font-extrabold text-lg mt-4 shadow-xl shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
          >
            {loading ? <><Loader2 className="w-6 h-6 animate-spin" /> Processando Fila Médica...</> : "Concluir Solicitação de Agenda"}
          </button>
          
          <p className="text-center text-xs text-slate-400 mt-2 font-medium">Ao clicar em concluir, as diretrizes da clínica sobre tratamento de dados e uso do Medsys AI são asseguradas.</p>

        </form>
      </div>

    </div>
  );
}