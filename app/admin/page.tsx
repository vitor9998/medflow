"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
      }
    };

    checkUser();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold">Painel Admin</h1>
      <p>Você está logado</p>
    </main>
  );
}