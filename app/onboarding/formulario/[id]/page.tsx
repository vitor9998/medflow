"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Playfair_Display } from "next/font/google";
import { Loader2, ArrowRight, Settings2, Bot, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const playfair = Playfair_Display({ subsets: ["latin"] });

export default function IntelligentForm() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [doctorName, setDoctorName] = useState("");

  const [answers, setAnswers] = useState({
    chatbot: false,
    resumo_ia: false,
    solicitar_exames: false,
    perguntas_especificas: "",
    qtd_secretarias: 1,
    qtd_medicos: 1,
    mensagens_personalizadas: false,
    texto_mensagens: ""
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const { data, error } = await supabase
        .from("doctor_onboarding")
        .select("nome, status")
        .eq("id", id)
        .single();
        
      if (error || !data) {
        alert("Cadastro não encontrado.");
        router.push("/onboarding/novo");
        return;
      }
      
      setDoctorName(data.nome);
      setLoading(false);
    }
    loadData();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, answers }),
      });

      if (!res.ok) throw new Error("Erro ao salvar respostas");

      // Redirect to proposal viewing page
      router.push(`/onboarding/proposta/${id}`);
    } catch (error) {
      alert("Erro ao gerar proposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`${playfair.className} text-4xl text-stone-900 mb-3`}>
            Personalize seu Consultório
          </h1>
          <p className="text-stone-500 text-lg">
            Olá, Dr(a). <span className="font-semibold text-emerald-900">{doctorName.split(' ')[0]}</span>! 
            Responda este formulário rápido para configurarmos a inteligência do seu sistema.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-stone-100">
          
          {/* Seção 1: Inteligência Artificial */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <Bot className="w-5 h-5 text-emerald-700" />
              <h3 className={`${playfair.className} text-2xl text-stone-800`}>Automação e IA</h3>
            </div>
            
            <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-medium text-stone-800">Chatbot para confirmação</p>
                <p className="text-xs text-stone-500 mt-1">A IA conversa com o paciente e confirma a presença no WhatsApp.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-emerald-900" checked={answers.chatbot} onChange={e => setAnswers({...answers, chatbot: e.target.checked})} />
            </label>

            <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-medium text-stone-800">Resumo de anamnese com IA</p>
                <p className="text-xs text-stone-500 mt-1">A IA lê os sintomas no WhatsApp e gera um resumo clínico no prontuário.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-emerald-900" checked={answers.resumo_ia} onChange={e => setAnswers({...answers, resumo_ia: e.target.checked})} />
            </label>

            <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
              <div>
                <p className="font-medium text-stone-800">Solicitar exames antes da consulta?</p>
                <p className="text-xs text-stone-500 mt-1">O robô pede exames antigos assim que o agendamento é feito.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-emerald-900" checked={answers.solicitar_exames} onChange={e => setAnswers({...answers, solicitar_exames: e.target.checked})} />
            </label>
          </div>

          {/* Seção 2: Estrutura */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <Users className="w-5 h-5 text-emerald-700" />
              <h3 className={`${playfair.className} text-2xl text-stone-800`}>Estrutura da Clínica</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Quantidade de Secretárias</label>
                <input type="number" min="0" value={answers.qtd_secretarias} onChange={e => setAnswers({...answers, qtd_secretarias: Number(e.target.value)})} className="w-full px-4 py-3 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 text-stone-800" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-stone-500 font-semibold ml-1">Quantidade de Médicos</label>
                <input type="number" min="1" value={answers.qtd_medicos} onChange={e => setAnswers({...answers, qtd_medicos: Number(e.target.value)})} className="w-full px-4 py-3 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 text-stone-800" />
              </div>
            </div>
          </div>

          {/* Seção 3: Customização */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <Settings2 className="w-5 h-5 text-emerald-700" />
              <h3 className={`${playfair.className} text-2xl text-stone-800`}>Personalização</h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-800 ml-1">Quais perguntas a IA deve fazer antes da consulta?</label>
              <p className="text-xs text-stone-500 ml-1 mb-2">Ex: Nível de dor, peso atual, histórico familiar...</p>
              <textarea 
                rows={3} 
                value={answers.perguntas_especificas} 
                onChange={e => setAnswers({...answers, perguntas_especificas: e.target.value})} 
                className="w-full px-4 py-3 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 text-stone-800 resize-none" 
                placeholder="Descreva o que é importante saber antes do paciente entrar no consultório."
              />
            </div>

            <div className="space-y-4 pt-4">
              <label className="flex items-center justify-between p-4 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50 transition-colors">
                <div>
                  <p className="font-medium text-stone-800">Deseja mensagens automáticas personalizadas?</p>
                  <p className="text-xs text-stone-500 mt-1">Mensagens com a voz e o tom exato da sua clínica.</p>
                </div>
                <input type="checkbox" className="w-5 h-5 accent-emerald-900" checked={answers.mensagens_personalizadas} onChange={e => setAnswers({...answers, mensagens_personalizadas: e.target.checked})} />
              </label>

              {answers.mensagens_personalizadas && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-sm font-medium text-stone-800 ml-1">Exemplo de como você gostaria que o robô falasse:</label>
                  <textarea 
                    rows={3} 
                    value={answers.texto_mensagens} 
                    onChange={e => setAnswers({...answers, texto_mensagens: e.target.value})} 
                    className="w-full px-4 py-3 bg-[#FDFCF8] border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-900 text-stone-800 resize-none" 
                    placeholder="Ex: Oiê! Aqui é a assistente do Dr. Carlos. Tudo bem com você?"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-8">
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white px-6 py-4 rounded-xl font-medium tracking-wide transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {submitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analisando respostas...</>
              ) : (
                <>Gerar Minha Proposta Personalizada <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
