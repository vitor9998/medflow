"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZyntraLogo } from "@/components/Logo";
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export default function SignupPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [accountType, setAccountType] = useState<"doctor" | "secretaria">("doctor");
  const [codigoClinica, setCodigoClinica] = useState("");
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      if (error.message.includes("User already registered")) {
         setErrorMsg("Este email já possui uma conta cadastrada. Tente fazer o login.");
      } else {
         setErrorMsg(`Falha na autenticação: ${error.message}`);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
          setErrorMsg("Este e-mail já existe. Tente fazer o login ou recupere sua senha.");
          setLoading(false);
          return;
      }

      let clinicaId: string | null = null;
      if (codigoClinica.trim()) {
        const { data: clinica, error: clinicaErr } = await supabase
          .from("clinicas")
          .select("id")
          .eq("codigo", codigoClinica.trim().toUpperCase())
          .single();

        if (clinicaErr || !clinica) {
          setErrorMsg("Código da clínica inválido. Verifique com a administração.");
          setLoading(false);
          return;
        }
        clinicaId = clinica.id;
      }

      const baseSlug = nome.toLowerCase().replace(/\s+/g, "-");
      const randomDigit = Math.floor(1000 + Math.random() * 9000);
      const slug = `${baseSlug}-${randomDigit}`;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            nome,
            slug: accountType === "doctor" ? slug : null,
            especialidade: accountType === "doctor" ? especialidade : null,
            telefone,
            role: accountType,
            status: "pending",
            clinica_id: clinicaId
          },
        ]);

      if (profileError) {
        setErrorMsg(`Não foi possível criar o perfil. Erro: ${profileError.message || ""}`);
      } else {
        if (accountType === "secretaria") {
          setSuccessMsg("Cadastro recebido. Aguardando aprovação...");
          setTimeout(() => router.push("/admin"), 2000);
        } else {
          setSuccessMsg("Perfil registrado com sucesso. Direcionando para análise...");
          setTimeout(() => router.push("/admin"), 2000);
        }
      }
    }

    setLoading(false);
  }

  return (
    <div className={`min-h-screen flex flex-col lg:flex-row bg-[#FDFCF8] text-stone-900 ${inter.className} selection:bg-emerald-900 selection:text-emerald-50`}>
      
      {/* LADO ESQUERDO: Ilustração / Info */}
      <div className="hidden lg:flex flex-col w-1/2 bg-stone-100 text-stone-900 p-12 justify-between relative overflow-hidden border-r border-stone-200/60">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-30 blur-[100px] rounded-full bg-blue-100 mix-blend-multiply"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] opacity-40 blur-[120px] rounded-full bg-stone-200 mix-blend-multiply"></div>

         <Link href="/" className="relative z-10 flex items-center gap-3 font-semibold tracking-tight hover:opacity-70 transition-opacity w-fit">
            <ZyntraLogo className="h-8 w-auto" />
         </Link>

         <div className="relative z-10 max-w-lg">
            <h2 className={`${playfair.className} text-6xl font-semibold mb-6 leading-[1.1] text-stone-800`}>
              A evolução do seu atendimento começa aqui.
            </h2>
            <p className="text-stone-500 text-xl font-light leading-relaxed">
              Junte-se ao ecossistema ZyntraMed e ofereça aos seus pacientes uma experiência digna do seu nome.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 text-xs tracking-widest uppercase font-semibold text-stone-400">
            © {new Date().getFullYear()} ZyntraMed.
         </div>
      </div>

      {/* LADO DIREITO: Formulário de Inscrição */}
      <div className="flex flex-col w-full lg:w-1/2 min-h-screen justify-center items-center p-6 sm:p-12 relative bg-[#FDFCF8] overflow-y-auto">
        
        <Link href="/" className="absolute top-8 left-8 lg:hidden flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors text-xs tracking-widest uppercase font-semibold">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        <Link href="/" className="absolute top-8 right-8 hidden lg:flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors text-xs tracking-widest uppercase font-semibold group">
          Voltar ao Início <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Logo visível no mobile */}
        <div className="lg:hidden flex items-center gap-2 font-bold text-2xl tracking-tight mb-8 mt-12">
            <ZyntraLogo className="h-8 w-auto text-emerald-900" />
        </div>

        <form
          onSubmit={handleSignup}
          className="w-full max-w-md flex flex-col pt-4 pb-10"
        >
          <div className="mb-10 text-center lg:text-left">
            <h1 className={`${playfair.className} text-4xl text-stone-900 tracking-tight mb-3`}>
              Nova Conta
            </h1>
            <p className="text-stone-500 font-light">
              {accountType === "doctor" ? "Configure seu perfil e abra sua agenda exclusiva." : "Gerencie as agendas e pacientes da clínica."}
            </p>
          </div>

          {/* TOGGLE MÚLTIPLO */}
          <div className="flex bg-stone-100/80 p-1 rounded-xl mb-10 border border-stone-200/50">
             <button
               type="button"
               onClick={() => setAccountType("doctor")}
               className={`flex-1 py-3 text-xs tracking-widest uppercase font-semibold rounded-lg transition-all ${accountType === "doctor" ? "bg-white text-emerald-900 shadow-sm border border-stone-200/50" : "text-stone-400 hover:text-stone-600"}`}
             >
               Sou Médico
             </button>
             <button
               type="button"
               onClick={() => setAccountType("secretaria")}
               className={`flex-1 py-3 text-xs tracking-widest uppercase font-semibold rounded-lg transition-all ${accountType === "secretaria" ? "bg-white text-emerald-900 shadow-sm border border-stone-200/50" : "text-stone-400 hover:text-stone-600"}`}
             >
               Sou Secretária
             </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-4 rounded-xl text-xs tracking-widest uppercase font-semibold mb-8 flex items-start gap-3">
               <AlertCircle className="w-4 h-4 shrink-0" />
               <p className="mt-0.5">{errorMsg}</p>
            </div>
          )}
          
          {successMsg && (
            <div className="bg-[#FDFCF8] border border-emerald-900/20 text-emerald-900 px-4 py-4 rounded-xl text-xs tracking-widest uppercase font-semibold mb-8 flex items-start gap-3">
               <CheckCircle2 className="w-4 h-4 shrink-0" />
               <p className="mt-0.5">{successMsg}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Nome Completo</label>
              <input
                placeholder={accountType === "doctor" ? "Dr(a). Seu Nome" : "Seu nome completo"}
                className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {accountType === "doctor" && (
                <div className="w-full">
                  <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Especialidade</label>
                  <input
                    placeholder="Ex: Cardiologia"
                    className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                    value={especialidade}
                    onChange={(e) => setEspecialidade(e.target.value)}
                    required={accountType === "doctor"}
                  />
                </div>
              )}
              <div className="w-full">
                <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Cód. Clínica</label>
                <input
                  placeholder="MEDSYS-001"
                  className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light uppercase"
                  value={codigoClinica}
                  onChange={(e) => setCodigoClinica(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Telefone (WhatsApp)</label>
              <input
                placeholder="(11) 99999-9999"
                className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Email {accountType === "doctor" && "Profissional"}</label>
              <input
                type="email"
                placeholder={accountType === "doctor" ? "contato@clinica.com" : "email@exemplo.com"}
                className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-900 focus:border-emerald-900 transition-all font-light"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs tracking-widest uppercase font-semibold text-stone-500 mb-3 ml-1">Senha Segura</label>
              <input
                type="password"
                placeholder="Mínimo de 8 caracteres"
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
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</> : "Finalizar Cadastro"}
          </button>

          <p className="text-center text-xs tracking-widest font-semibold text-stone-400 border-t border-stone-200/60 pt-8 uppercase">
            Já possui acesso?{" "}
            <Link
              href="/login"
              className="text-emerald-900 font-bold hover:text-emerald-700 transition-colors ml-1"
            >
              Fazer login
            </Link>
          </p>
        </form>

      </div>
    </div>
  );
}