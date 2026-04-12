"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Agendamento() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);

  const salvar = async () => {
    if (!nome || !email || !telefone || !data) {
      alert("Preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("agendamentos").insert([
        {
          nome,
          email,
          telefone,
          data,
        },
      ]);

      if (error) throw error;

      // ENVIA EMAIL
      await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          telefone,
          data,
        }),
      });

      alert("Agendamento confirmado!");

      // limpa campos
      setNome("");
      setEmail("");
      setTelefone("");
      setData("");

    } catch (err) {
      console.error(err);
      alert("Erro ao salvar agendamento");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Agendar Consulta</h1>

      <input
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        style={{ display: "block", marginBottom: "10px" }}
      />

      <button onClick={salvar} disabled={loading}>
        {loading ? "Salvando..." : "Confirmar Agendamento"}
      </button>
    </main>
  );
}