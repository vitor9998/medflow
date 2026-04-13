"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { Loader2, LogOut, Calendar, Clock, Activity, FileText } from "lucide-react";

export default function PortalLayout({
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
        
      if (prof?.role !== "patient") {
        router.push("/admin"); // Not a patient, kick out
        return;
      }

      setProfile(prof);
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-emerald-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <Link href="/portal" className="font-extrabold text-xl tracking-tight text-slate-900 flex items-center gap-2">
             <MedsysLogo className="h-7 w-auto text-emerald-600 drop-shadow-sm" /> Medsys <span className="text-emerald-600 font-medium ml-1">Portal</span>
           </Link>
           
           <div className="flex items-center gap-6">
             <span className="hidden sm:inline-block font-semibold text-slate-600 text-sm">Olá, {profile.nome?.split(" ")[0]}</span>
             <button 
               onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
               className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2 text-sm font-bold"
             >
               <span className="hidden sm:inline">Sair</span>
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
