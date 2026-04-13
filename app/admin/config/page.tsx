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
    id: ""
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
          email: user.email || ""
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
        // email is read only, mostly managed by auth
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
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-4xl mx-auto w-full">
      <div className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-slate-400 mt-1">Gerencie os dados do seu perfil médico público.</p>
      </div>

      <Card className="p-6 md:p-8 shrink-0">
        <form onSubmit={handleSave} className="flex flex-col gap-6">
          
          {/* FOTO - Mock simples por agora */}
          <div className="flex items-center gap-6 mb-2">
            <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-inner">
               <span className="text-3xl font-bold text-slate-500">{profile.nome?.substring(0, 1)?.toUpperCase() || "Dr"}</span>
            </div>
            <div>
               <button type="button" className="text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-gray-700">
                 Alterar Foto
               </button>
               <p className="text-xs text-slate-500 mt-2 max-w-xs">JPG, GIF ou PNG. Tamanho máximo recomendado de 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  required
                  value={profile.nome}
                  onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                  className="pl-10 w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Ex: Dr. Carlos Silva"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Especialidade</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={profile.especialidade}
                  onChange={(e) => setProfile({ ...profile, especialidade: e.target.value })}
                  className="pl-10 w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Ex: Cardiologia"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Telefone / WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  value={profile.telefone}
                  onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                  className="pl-10 w-full bg-[#020617] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  placeholder="Ex: 11999999999"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-500 ml-1">Email <span className="text-xs text-slate-600">(Apenas Leitura)</span></label>
              <div className="relative opacity-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="pl-10 w-full bg-slate-900 border border-gray-800 rounded-xl px-4 py-3 text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Feedback & Botão */}
          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
            
            <div className="flex-1">
              {successMsg && (
                <div className="inline-flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg text-sm font-medium border border-emerald-500/20 animate-fade-in-up">
                  <CheckCircle2 className="w-4 h-4" />
                  {successMsg}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
            >
              {isSaving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Salvando...</>
              ) : (
                <><Save className="w-5 h-5" /> Salvar Alterações</>
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
