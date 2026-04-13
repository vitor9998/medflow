"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LandingPage() {
  const [medicos, setMedicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarMedicos();
  }, []);

  async function buscarMedicos() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*");

    if (!error) {
      setMedicos(data || []);
    }

    setLoading(false);
  }

  return (
    <div className="bg-[#020617] text-white min-h-screen">

      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-4xl font-bold mb-4">
          Clínica Saúde+
        </h1>

        <p className="text-gray-400 mb-6 max-w-xl mx-auto">
          Atendimento clínico com qualidade, praticidade e organização.
          Agende sua consulta em poucos segundos.
        </p>

        <Link
          href="/agendamento"
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
        >
          Agendar Consulta
        </Link>

        <p className="text-sm text-gray-500 mt-4">
          ⭐ Mais de 100 pacientes atendidos
        </p>
      </section>

      {/* 🔥 MÉDICOS */}
      <section className="px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Escolha seu médico
        </h2>

        {loading ? (
          <p className="text-center text-gray-400">
            Carregando médicos...
          </p>
        ) : medicos.length === 0 ? (
          <p className="text-center text-gray-400">
            Nenhum médico disponível
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {medicos.map((medico) => (
              <div
                key={medico.id}
                className="bg-[#0B1120] p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition"
              >
                <h3 className="text-lg font-bold">
                  Dr {medico.nome || "Sem nome"}
                </h3>

                <p className="text-gray-400 mb-4">
                  {medico.especialidade || "Sem especialidade"}
                </p>

                <Link
                  href={`/agendamento/${medico.slug}`}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
                >
                  Agendar consulta
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📍 LOCALIZAÇÃO */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto bg-[#0B1120] p-6 rounded-xl border border-gray-800 text-center">
          <h2 className="text-xl font-bold mb-2">
            Onde estamos
          </h2>

          <p className="text-gray-400 mb-4">
            📍 Rua Exemplo, 123 - São Paulo
          </p>

          {/* MAPA SIMPLES (placeholder) */}
          <div className="w-full h-[300px] bg-gray-800 rounded-xl flex items-center justify-center text-gray-500">
            Mapa aqui
          </div>
        </div>
      </section>

    </div>
  );
}