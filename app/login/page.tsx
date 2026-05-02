"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZyntraLogo } from "@/components/Logo";
import { ArrowLeft, Loader2, Hospital } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

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
        router.push("/paciente");
      } else if (prof?.role === "secretaria") {
        router.push("/admin/secretaria");
      } else {
        router.push("/admin");
      }
    }

    setLoading(false);
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50`}>
      
      {/* LADO ESQUERDO: Ilustração / Info (Oculto no mobile) */}
      <div className="hidden md:flex flex-col w-1/2 bg-stone-100 text-stone-900 p-12 justify-between relative overflow-hidden border-r border-stone-200/60">
         <div className="absolute top-0 right-0 p-32 opacity-30 blur-3xl rounded-full bg-blue-100 mix-blend-multiply"></div>
         <div className="absolute bottom-0 left-0 p-40 opacity-40 blur-3xl rounded-full bg-stone-200 mix-blend-multiply"></div>

         <Link href="/" className="relative z-10 flex items-center gap-3 font-semibold tracking-tight hover:opacity-70 transition-opacity w-fit">
            <ZyntraLogo className="h-8 w-auto" />
         </Link>

         <div className="relative z-10 max-w-md">
            <h2 className={`${playfair.className} text-5xl font-semibold mb-6 leading-tight text-stone-800`}>
              A central de comando da sua clínica.
            </h2>
            <p className="text-stone-500 text-lg font-light leading-relaxed">
              Acesse o painel inteligente construído para médicos que exigem excelência na gestão e no cuidado.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-xs tracking-widest uppercase font-semibold text-stone-400">
            © {new Date().getFullYear()} ZyntraMed.
         </div>
      </div>

      {/* LADO DIREITO: Formulário */}
      <div className="flex flex-col w-full md:w-1/2 min-h-screen justify-center items-center p-6 md:p-12 relative bg-[#FDFCF8]">
        
        <Link href="/" className="absolute top-8 left-8 md:hidden flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-xs tracking-widest uppercase font-semibold">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link href="/" className="absolute top-8 right-8 hidden md:flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs tracking-widest uppercase font-semibold group">
          Voltar ao Início <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Logo visível no mobile */}
        <div className="md:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-12 mt-8">
            <ZyntraLogo className="h-8 w-auto text-emerald-900" />
        </div>

        <form
          onSubmit={handleLogin}
          className="w-full max-w-md flex flex-col pt-8"
        >
          <div className="mb-12 text-center md:text-left">
            <h1 className={`${playfair.className} text-4xl text-stone-900 tracking-tight mb-3`}>
              Acesso
            </h1>
            <p className="text-stone-500 font-light">
              Identifique-se para entrar no sistema.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Email Profissional</label>
              <input
                type="email"
                placeholder="doutor@clinica.com"
                className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-3 ml-1 px-1">
                <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500">Senha Segura</label>
                <Link href="#" className="text-xs font-semibold text-emerald-900 hover:text-emerald-700 transition-colors">Esqueci minha senha</Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50 text-white py-4 rounded-xl font-medium mt-10 mb-8 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Autenticando...</> : "Entrar no Sistema"}
          </button>

          <div className="text-center text-xs tracking-widest font-semibold text-stone-400 border-t border-stone-200/60 pt-8 uppercase">
            Ainda não possui conta?{" "}
            <Link
              href="/signup"
              className="text-emerald-900 font-bold hover:text-emerald-700 transition-colors ml-1"
            >
              Criar conta
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
}