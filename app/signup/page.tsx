"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MedsysLogo } from "@/components/Logo";
import { ArrowLeft, Loader2, Users } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSignup(e: any) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    // 🔐 cria usuário
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
         setErrorMsg("Esse email já possui uma conta cadastrada. Tente fazer o login.");
      } else {
         setErrorMsg(`Falha na autenticação: ${error.message}`);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      // Cria um slug 100% único adicionando 4 dígitos aleatórios pra não travar testes
      const baseSlug = nome.toLowerCase().replace(/\s+/g, "-");
      const randomDigit = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomDigit}`;

      // 🔥 cria profile completo
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            nome,
            slug,
            especialidade,
            telefone,
          },
        ]);

      if (profileError) {
        console.log("Erro no Profile:", profileError);
        // Pode ser um erro de slug duplicado no DB
        setErrorMsg(`Não foi possível criar o perfil médico. Tente alterar o nome fornecido. Erro Banco: ${profileError.message || ""}`);
      } else {
        setSuccessMsg("Conta e estrutura médica criadas com sucesso! Redirecionando...");
        setTimeout(() => {
           router.push("/admin");
        }, 1500);
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans text-slate-900 selection:bg-emerald-200">
      
      {/* LADO ESQUERDO: Ilustração / Info */}
      <div className="hidden md:flex flex-col w-1/2 md:w-[40%] lg:w-1/2 bg-[#020617] text-white p-12 justify-between relative overflow-hidden">
         <div className="absolute top-0 right-0 p-32 opacity-15 blur-3xl rounded-full bg-teal-500"></div>
         <div className="absolute bottom-0 left-0 p-40 opacity-20 blur-3xl rounded-full bg-emerald-800"></div>

         <div className="relative z-10 flex items-center gap-2 font-bold text-2xl tracking-tight">
            <MedsysLogo className="h-8 w-auto" /> Medsys
         </div>

         <div className="relative z-10 max-w-md">
            <Users className="w-12 h-12 text-teal-400 mb-6" />
            <h2 className="text-4xl font-extrabold mb-4">Mais consultas. Menos tarefas.</h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              Dê as boas-vindas ao ecossistema que automatiza confirmações, simplifica o prontuário e conecta o paciente diretamente a você.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
            © {new Date().getFullYear()} Medsys. Todos os direitos reservados.
         </div>
      </div>

      {/* LADO DIREITO: Formulário de Inscrição */}
      <div className="flex flex-col w-full md:w-[60%] lg:w-1/2 min-h-screen justify-center items-center p-6 md:p-12 relative bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.02)] overflow-y-auto">
        
        <Link href="/" className="absolute top-6 left-6 md:hidden flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link href="/" className="absolute top-8 right-8 hidden md:flex items-center gap-2 text-slate-500 font-medium hover:text-slate-900 transition-colors text-sm">
          Acessar página inicial <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>

        {/* Logo visível no mobile */}
        <div className="md:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 mt-12">
            <MedsysLogo className="h-8 w-auto drop-shadow-sm" /> Medsys
        </div>

        <form
          onSubmit={handleSignup}
          className="w-full max-w-md flex flex-col pt-4 pb-10"
        >
          <div className="mb-6 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Criar Conta Médica
            </h1>
            <p className="text-slate-500">
              Configure seu perfil e abra sua agenda agora.
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6 flex items-start gap-2 shadow-sm">
               <span className="shrink-0 mt-0.5">⚠️</span>
               <p>{errorMsg}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm font-semibold mb-6 flex items-start gap-2 shadow-sm">
               <span className="shrink-0 mt-0.5">✅</span>
               <p>{successMsg}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Nome Completo</label>
              <input
                placeholder="Dr(a). Seu Nome"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Especialidade</label>
                <input
                  placeholder="Cardiologia"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Telefone / WhatsApp</label>
                <input
                  placeholder="(xx) xxxxx-xxxx"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-sm"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>

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
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Criar Senha</label>
              <input
                type="password"
                placeholder="Mínimo de 8 caracteres"
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
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold mt-8 mb-6 shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : "Finalizar Cadastro"}
          </button>

          <p className="text-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-6">
            Já possui uma estrutura ativa?{" "}
            <Link
              href="/login"
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
            >
              Fazer login
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}