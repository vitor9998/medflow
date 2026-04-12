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

  const senhaCorreta = "123456";

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

  const deletar = async (id: number) => {
    const confirm = window.confirm("Tem certeza que deseja excluir?");
    if (!confirm) return;

    await supabase.from("agendamentos").delete().eq("id", id);

    alert("Excluído com sucesso!");

    // atualiza lista sem reload
    setDados((prev) => prev.filter((item) => item.id !== id));
  };

  useEffect(() => {
    if (logado) {
      buscar();
    }
  }, [logado]);

  // 🔐 LOGIN
  if (!logado) {
    return (
      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <h1>Login Admin</h1>

        <input
          type="password"
          placeholder="Digite a senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ padding: "8px", marginTop: "10px" }}
        />

        <br /><br />

        <button
          onClick={() => {
            if (senha === senhaCorreta) {
              setLogado(true);
            } else {
              alert("Senha incorreta");
            }
          }}
          style={{
            padding: "8px 16px",
            cursor: "pointer"
          }}
        >
          Entrar
        </button>
      </main>
    );
  }

  // 📊 ADMIN
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Painel Admin</h1>

      {loading && <p>Carregando...</p>}

      {!loading && dados.length === 0 && <p>Nenhum agendamento encontrado</p>}

      {!loading &&
        dados.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "8px"
            }}
          >
            <p><b>Nome:</b> {item.nome}</p>
            <p><b>Email:</b> {item.email}</p>
            <p><b>Telefone:</b> {item.telefone}</p>
            <p><b>Data:</b> {item.data}</p>

            <button
              onClick={() => deletar(item.id)}
              style={{
                marginTop: "10px",
                background: "red",
                color: "white",
                border: "none",
                padding: "6px 12px",
                cursor: "pointer",
                borderRadius: "4px"
              }}
            >
              Excluir
            </button>
          </div>
        ))}
    </main>
  );
}