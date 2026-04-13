"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [nome, setNome] = useState("");
  const router = useRouter();

  useEffect(() => {
    getUser();

    // 🔥 LISTENER DE AUTH (isso resolve tudo)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("nome")
        .eq("id", user.id)
        .single();

      setNome(data?.nome || "");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    setUser(null);      // 🔥 força limpar
    setNome("");        // 🔥 limpa nome

    router.push("/login");
  }

  return (
    <nav className="w-full bg-[#020617] border-b border-gray-800 px-6 py-4 flex justify-between items-center">

      <h1 className="font-bold text-lg text-white">
        Clínica Saúde+
      </h1>

      <div className="flex items-center gap-6">

        <Link href="/" className="text-gray-300 hover:text-white">
          Home
        </Link>

        <Link href="/pricing" className="text-gray-300 hover:text-white">
          Preços
        </Link>

        <Link href="/agendamento" className="text-gray-300 hover:text-white">
          Agendar
        </Link>

        {user ? (
          <>
            <span className="text-sm text-gray-400">
              {nome || user.email}
            </span>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm"
            >
              Sair
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm"
          >
            Começar
          </Link>
        )}

      </div>
    </nav>
  );
}