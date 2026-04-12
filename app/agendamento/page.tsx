"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";

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
      // 🔍 Verifica se já existe agendamento na data
      const { data: existente } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", data);

      if (existente && existente.length > 0) {
        alert("Já existe um agendamento para essa data!");
        setLoading(false);
        return;
      }

      // 💾 Salva no banco
      const { error } = await supabase.from("agendamentos").insert([
        {
          nome,
          email,
          telefone,
          data,
        },
      ]);

      if (error) throw error;

      // 📧 Envia email
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

      // 📲 WhatsApp automático
      const mensagem = `Novo agendamento:
Nome: ${nome}
Email: ${email}
Telefone: ${telefone}
Data: ${data}`;

      const numero = "5511948157490"; // ⚠️ coloca seu número aqui

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");

      alert("Agendamento confirmado!");

      // limpar campos
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
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <input
        placeholder="Telefone"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        style={{ display: "block", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={salvar}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#0070f3",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Salvando..." : "Confirmar Agendamento"}
      </button>
    </main>
  );
}