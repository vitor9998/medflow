"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Card } from "@/components/Card";
import { User, Phone, Briefcase, Mail, Save, Loader2, CheckCircle2 } from "lucide-react";

export default function ConfigPage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>({
    nome: "",
    especialidade: "",
    telefone: "",
    email: "",
    id: "",
    descricao_perfil: "",
    filosofia: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) {
        console.log("Erro ao carregar perfil:", error);
      } else {
        setProfile({
          id: user.id,
          nome: data?.nome || "",
          especialidade: data?.especialidade || "",
          telefone: data?.telefone || "",
          email: user.email || "",
          descricao_perfil: data?.descricao_perfil || "",
          filosofia: data?.filosofia || ""
        });
      }
      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg("");

    const { error } = await supabase
      .from("profiles")
      .update({
        nome: profile.nome,
        especialidade: profile.especialidade,
        telefone: profile.telefone,
        descricao_perfil: profile.descricao_perfil,
        filosofia: profile.filosofia
      })
      .eq("id", profile.id);

    setIsSaving(false);

    if (error) {
      alert("Erro ao salvar os dados.");
      console.log(error);
    } else {
      setSuccessMsg("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuracoes</h1>
        <p className="text-slate-500 mt-1 text-sm">Gerencie os dados do seu perfil medico publico.</p>
      </div>

      <Card className="p-6 md:p-8 shrink-0">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* Photo */}
          <div className="flex items-center gap-6 mb-2">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200">
               <span className="text-2xl font-bold text-slate-400">{profile.nome?.substring(0, 1)?.toUpperCase() || "Dr"}</span>
            </div>
            <div>
               <button type="button" className="text-sm font-medium bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg transition-colors border border-slate-200">
                 Alterar Foto
               </button>
               <p className="text-xs text-slate-400 mt-2 max-w-xs">JPG, GIF ou PNG. Tamanho maximo recomendado de 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-0.5">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  className="pl-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="Ex: Dr. Carlos Silva"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-0.5">Especialidade</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={profile.especialidade}
                  onChange={(e) => setProfile({ ...profile, especialidade: e.target.value })}
                  className="pl-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="Ex: Cardiologia"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500 ml-0.5">Telefone / WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={profile.telefone}
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                  className="pl-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                  placeholder="Ex: 11999999999"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 ml-0.5">Email <span className="text-xs text-slate-300">(Apenas Leitura)</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-300" />
                </div>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="pl-10 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* PERFIL EDITORIAL PUBLICO */}
          <div className="pt-6 mt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Apresentação Pública (Editorial)</h3>
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-0.5">Descrição Curta (Hero)</label>
                <textarea
                  rows={2}
                  value={profile.descricao_perfil}
                  onChange={(e) => setProfile({ ...profile, descricao_perfil: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Ex: Uma abordagem exclusiva e humanizada para a sua saúde..."
                />
                <p className="text-[10px] text-slate-400 ml-1">Fica em destaque na sua página de agendamento.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 ml-0.5">Filosofia de Cuidado (Sessão sobre o Médico)</label>
                <textarea
                  rows={4}
                  value={profile.filosofia}
                  onChange={(e) => setProfile({ ...profile, filosofia: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all resize-none"
                  placeholder="Ex: Acredito que a medicina verdadeira vai além do diagnóstico. É sobre entender o paciente em sua totalidade..."
                />
                <p className="text-[10px] text-slate-400 ml-1">Sua biografia e visão sobre o cuidado com os pacientes.</p>
              </div>
            </div>
          </div>

          {/* Feedback & Button */}
          <div className="pt-5 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
            
            <div className="flex-1">
              {successMsg && (
                <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-200 animate-fade-in-up">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMsg}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-4 h-4" /> Salvar Alteracoes</>
              )}
            </button>
          </div>

        </form>
      </Card>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}
