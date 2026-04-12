"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white max-w-xl w-full p-10 rounded-2xl shadow-lg text-center">

        <h1 className="text-3xl font-bold mb-4">
          Dr. João Silva
        </h1>

        <p className="text-gray-600 mb-6">
          Atendimento clínico geral com foco na sua saúde e bem-estar.
          Agende sua consulta de forma rápida e simples.
        </p>

        <Link href="/agendamento">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Agendar Consulta
          </button>
        </Link>

        <div className="mt-8 text-sm text-gray-400">
          Atendimento humanizado • Fácil • Rápido
        </div>

      </div>
    </main>
  );
}