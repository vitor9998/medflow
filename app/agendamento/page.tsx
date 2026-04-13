"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function Page() {
  const [medicos, setMedicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, especialidade, slug")
        .not("slug", "is", null);

      if (error) {
        console.log("Erro ao buscar médicos:", error);
        return;
      }

      setMedicos(data || []);
      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-12">

      {/* TÍTULO */}
      <h1 className="text-4xl font-bold text-center mb-12">
        Escolha um médico
      </h1>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-400">
          Carregando médicos...
        </p>
      )}

      {/* LISTA */}
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

        {medicos.map((m) => (
          <div
            key={m.id}
            className="bg-[#0B1120] border border-gray-800 p-6 rounded-2xl hover:border-green-500 transition duration-300"
          >
            {/* HEADER */}
            <div className="flex items-center gap-4 mb-6">
              {/* Avatar fake */}
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-black font-bold">
                {m.nome?.charAt(0)?.toUpperCase() || "M"}
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  {m.nome}
                </h2>
                <p className="text-sm text-gray-400">
                  {m.especialidade}
                </p>
              </div>
            </div>

            {/* BOTÃO */}
            <Link
              href={`/agendamento/${m.slug}`}
              className="block bg-green-500 hover:bg-green-600 text-center py-2 rounded-lg font-semibold transition"
            >
              Agendar consulta
            </Link>
          </div>
        ))}

      </div>

      {/* CASO NÃO TENHA MÉDICOS */}
      {!loading && medicos.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          Nenhum médico disponível
        </p>
      )}

    </div>
  );
}