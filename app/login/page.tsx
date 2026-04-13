"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { ArrowLeft, Loader2, Hospital } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔐 LOGIN
  async function handleLogin(e: any) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      alert("Email ou senha inválidos");
    } else if (data.user) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (prof?.role === "patient") {
        router.push("/portal");
      } else {
        router.push("/admin");
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      
      {/* LADO ESQUERDO: Ilustração / Info (Oculto no mobile) */}
      <div className="hidden md:flex flex-col w-1/2 bg-[#020617] text-white p-12 justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl rounded-full bg-emerald-500"></div>
         <div className="absolute bottom-0 left-0 p-40 opacity-20 blur-3xl rounded-full bg-teal-800"></div>

         <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
            <MedsysLogo className="h-8 w-auto" /> Medsys
         </div>

         <div className="relative z-10 max-w-md">
            <Hospital className="w-12 h-12 text-emerald-400 mb-6" />
            <h2 className="text-4xl font-extrabold mb-4">A central nervosa da sua clínica.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Assuma o hiper-controle da sua agenda e erradique as faltas usando o painel inteligente construído para médicos exigentes.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Medsys. Todos os direitos reservados.
         </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="flex flex-col w-full md:w-1/2 min-h-screen justify-center items-center p-6 md:p-12 relative bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)]">
        
        <Link href="/" className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link href="/" className="absolute top-8 right-8 hidden md:flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm">
          Acessar página inicial <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>

        {/* Logo visível no mobile */}
        <div className="md:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-12 mt-8">
            <MedsysLogo className="h-8 w-auto drop-shadow-sm" /> Medsys
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md flex flex-col pt-8"
        >
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Acesse sua Conta
            </h1>
            <p className="text-slate-500">
              Digite seu email e senha de acesso abaixo.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Profissional</label>
              <input
                type="email"
                placeholder="doutor@clinica.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5 ml-1 px-1">
                <label className="block text-sm font-semibold text-slate-700">Senha Segura</label>
                <Link href="#" className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Esqueci minha senha</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm font-sans"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold mt-8 mb-6 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Autenticando...</> : "Entrar no Sistema"}
          </button>

          <div className="text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-6">
            Sua clínica ainda não digitalizou a demanda?{" "}
            <Link
              href="/signup"
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
            >
              Criar conta
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}