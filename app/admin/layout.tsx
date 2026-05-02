"use client";

import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Lock } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const initialized = useRef(false);
 
   useEffect(() => {
     async function checkAuth() {
       if (initialized.current) return;
       initialized.current = true;
 
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
      <div className={`min-h-screen bg-[#FDFCF8] flex items-center justify-center text-emerald-900 ${inter.className}`}>
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Se for bloqueado ou pendente
  if (profile?.status === "pending" || profile?.status === "suspended") {
    return (
      <div className={`min-h-screen bg-[#FDFCF8] flex items-center justify-center text-stone-700 ${inter.className}`}>
        <div className="bg-white p-12 rounded-[2rem] border border-stone-200/60 text-center max-w-md shadow-2xl shadow-stone-200/50 flex flex-col items-center">
           <div className="w-20 h-20 bg-emerald-50 text-emerald-900 rounded-full flex items-center justify-center mb-8 border border-emerald-100">
             <Lock className="w-10 h-10" />
           </div>
           <h2 className={`${playfair.className} text-3xl font-semibold text-stone-900 mb-4`}>Conta em Análise</h2>
           <p className="text-stone-500 font-light leading-relaxed mb-8">
             Seu perfil médico foi recebido com sucesso. Nosso time está verificando suas credenciais. Você receberá um e-mail em breve assim que sua agenda for liberada para captação de pacientes.
           </p>
           <button 
             onClick={() => {supabase.auth.signOut(); router.push('/login');}}
             className="text-emerald-900 font-bold hover:text-emerald-700 text-sm tracking-widest uppercase"
           >
             Sair e voltar depois
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-[#FDFCF8] text-stone-800 ${inter.className}`}>
      <Sidebar role={profile?.role} />
      <main className="flex-1 flex flex-col min-h-0 h-screen overflow-hidden overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}
