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
      const { data: existente } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("data", data);

      if (existente && existente.length > 0) {
        alert("Já existe um agendamento para essa data!");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("agendamentos").insert([
        { nome, email, telefone, data },
      ]);

      if (error) throw error;

      await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, telefone, data }),
      });

      const mensagem = `Novo agendamento:
Nome: ${nome}
Email: ${email}
Telefone: ${telefone}
Data: ${data}`;

      const numero = "5511999999999";

      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;

      window.open(url, "_blank");

      alert("Agendamento confirmado!");

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
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Agendar Consulta
        </h1>

        <input
          className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <input
          type="date"
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />

        <button
          onClick={salvar}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          {loading ? "Salvando..." : "Confirmar Agendamento"}
        </button>
      </div>
    </main>
  );
}