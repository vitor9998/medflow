"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Agendamento = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  data: string;
};

export default function Admin() {
  const [dados, setDados] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  const buscar = async () => {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) {
      setDados(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    buscar();
  }, []);

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Painel Admin</h1>

      {loading && <p>Carregando...</p>}

      {!loading && dados.length === 0 && <p>Nenhum agendamento</p>}

      {!loading &&
        dados.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
            }}
          >
            <p><b>Nome:</b> {item.nome}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Telefone:</b> {item.telefone}</p>
            <p><b>Data:</b> {item.data}</p>
          </div>
        ))}
    </main>
  );
}