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
  const [logado, setLogado] = useState(false);
  const [senha, setSenha] = useState("");

  const senhaCorreta = "123456"; // depois podemos melhorar

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
    if (logado) {
      buscar();
    }
  }, [logado]);

  if (!logado) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Login Admin</h1>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <br /><br />

        <button onClick={() => {
          if (senha === senhaCorreta) {
            setLogado(true);
          } else {
            alert("Senha errada");
          }
        }}>
          Entrar
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Painel Admin</h1>

      {loading && <p>Carregando...</p>}

      {!loading &&
        dados.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
            <p><b>Nome:</b> {item.nome}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Telefone:</b> {item.telefone}</p>
            <p><b>Data:</b> {item.data}</p>
          </div>
        ))}
    </main>
  );
}