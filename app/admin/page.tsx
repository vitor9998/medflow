"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const carregar = async () => {
      const { data: userData } = await supabase.auth.getUser();

      const user = userData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      // 🔥 busca só os dados do usuário
      const { data } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id);

      setAgendamentos(data || []);
    };

    carregar();
  }, []);

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">Seus Agendamentos</h1>

      {agendamentos.map((item) => (
        <div key={item.id} className="border p-4 mb-2 rounded">
          <p><strong>Nome:</strong> {item.nome}</p>
          <p><strong>Email:</strong> {item.email}</p>
          <p><strong>Telefone:</strong> {item.telefone}</p>
          <p><strong>Data:</strong> {item.data}</p>
        </div>
      ))}
    </main>
  );
}