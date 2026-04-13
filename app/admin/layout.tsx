"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Lock } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      setProfile(prof);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Se for bloqueado ou pendente
  if (profile?.status === "pending" || profile?.status === "suspended") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-200">
        <div className="bg-[#0B1120] p-10 rounded-3xl border border-gray-800 text-center max-w-md shadow-2xl flex flex-col items-center">
           <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
             <Lock className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-bold text-white mb-3">Conta em Análise</h2>
           <p className="text-slate-400 leading-relaxed mb-6">
             Seu perfil médico foi recebido com sucesso. Nosso time está verificando suas credenciais. Você receberá um e-mail em breve assim que sua agenda for liberada para captação de pacientes.
           </p>
           <button 
             onClick={() => {supabase.auth.signOut(); router.push('/login');}}
             className="text-emerald-500 font-semibold hover:text-emerald-400"
           >
             Sair e voltar depois
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#020617] text-slate-200 font-sans">
      <Sidebar role={profile?.role} />
      <main className="flex-1 flex flex-col min-h-0 h-screen overflow-hidden overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
