"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 🔥 PRIORIDADE
function calcularPrioridade(sintomas: string) {
  const texto = sintomas.toLowerCase();

  if (
    texto.includes("febre") ||
    texto.includes("dor forte") ||
    texto.includes("falta de ar") ||
    texto.includes("pressão no peito")
  ) {
    return "urgente";
  }

  if (
    texto.includes("dor") ||
    texto.includes("cansaço") ||
    texto.includes("tontura")
  ) {
    return "moderado";
  }

  return "leve";
}

export default function AgendamentoPage() {
  const params = useParams();
  const slug = params.medico as string;

  const [medico, setMedico] = useState<any>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 buscar médico pelo slug
  useEffect(() => {
    async function buscarMedico() {
      if (!slug) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        console.log("Erro ao buscar médico:", error);
        return;
      }

      setMedico(data);
    }

    buscarMedico();
  }, [slug]);

  async function salvar(e: any) {
    e.preventDefault();
    setLoading(true);

    if (!medico) {
      alert("Médico não encontrado");
      setLoading(false);
      return;
    }

    const prioridade = calcularPrioridade(sintomas);

    const { error } = await supabase.from("agendamentos").insert([
      {
        nome,
        email,
        telefone,
        data,
        hora,
        sintomas,
        status: "pendente",
        prioridade,
        user_id: medico.id, // 🔥 VINCULA AO MÉDICO CERTO
      },
    ]);

    if (error) {
      alert("Erro ao salvar");
      console.log(error);
    } else {
      alert("Consulta agendada com sucesso!");
      setNome("");
      setEmail("");
      setTelefone("");
      setData("");
      setHora("");
      setSintomas("");
    }

    setLoading(false);
  }

  // 🔥 LOADING
  if (!medico) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] text-white">
        Carregando médico...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-6">

      <form
        onSubmit={salvar}
        className="bg-[#0B1120] p-8 rounded-2xl border border-gray-800 w-full max-w-md space-y-4"
      >
        <h1 className="text-white text-2xl font-bold text-center">
          Agendar com {medico.nome}
        </h1>

        <input
          placeholder="Nome"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          placeholder="Email"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          placeholder="Telefone"
          className="w-full p-3 rounded bg-[#020617] border border-gray-700 text-white"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          required
        />

        <input
          type="date"
          className="w-full p-3 rounded bg-[#020617] text-white"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />

        <input
          type="time"
          className="w-full p-3 rounded bg-[#020617] text-white"
          value={hora}
          onChange={(e) => setHora(e.target.value)}
          required
        />

        <textarea
          placeholder="Descreva seus sintomas..."
          className="w-full p-3 rounded bg-[#020617] text-white"
          value={sintomas}
          onChange={(e) => setSintomas(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
        >
          {loading ? "Salvando..." : "Confirmar Agendamento"}
        </button>
      </form>
    </div>
  );
}