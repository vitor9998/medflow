"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Stethoscope, Calendar } from "lucide-react";
import { ZyntraLogo } from "@/components/Logo";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [nome, setNome] = useState("");
  const router = useRouter();

  useEffect(() => {
    // 🔥 Listener de autenticação
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: any, session: any) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser) {
          const { data } = await supabase
            .from("profiles")
            .select("nome")
            .eq("id", currentUser.id)
            .single();

          setNome(data?.nome || "");
        } else {
          setNome("");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // getUser removido pois o onAuthStateChange já dispara imediatamente ao montar.
  // 🚪 Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setNome("");
    router.push("/login");
  }

  return (
    <nav className="w-full bg-[#020617] border-b border-gray-800 px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <h1 className="font-bold text-lg text-white flex items-center gap-2">
        <ZyntraLogo className="h-6 w-auto" /> ZyntraMed
      </h1>

      {/* MENU */}
      <div className="flex items-center gap-6">

        {/* HOME */}
        <Link href="/" className="text-gray-300 hover:text-white">
          Home
        </Link>

        {/* 👤 PACIENTE */}
        <Link
          href="/agendamento"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <Calendar size={16} />
          Agendar consulta
        </Link>

        {/* 👨‍⚕️ MÉDICO (ANTES ERA "PREÇOS") */}
        <Link
          href="/pricing"
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <Stethoscope size={16} />
          Para médicos
        </Link>

        {/* 🔐 ÁREA LOGADA */}
        {user ? (
          <>
            <span className="text-sm text-gray-400">
              {nome || user.email}
            </span>

            <Link
              href="/admin"
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              <Stethoscope size={16} />
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm text-white"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2 text-white"
          >
            <Stethoscope size={16} />
            Área do médico
          </Link>
        )}

      </div>
    </nav>
  );
}