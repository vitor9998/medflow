"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-16">

      {/* HERO */}
      <div className="bg-white max-w-xl w-full p-10 rounded-2xl shadow-lg text-center">

        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          Clínica Saúde+
        </h1>

        <p className="text-gray-600 mb-6">
          Atendimento clínico com qualidade, praticidade e organização.
          Agende sua consulta em poucos segundos.
        </p>

        <Link href="/agendamento">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
            Agendar Consulta
          </button>
        </Link>

        {/* prova social */}
        <div className="mt-6 text-sm text-gray-500">
          ⭐ Mais de 100 pacientes atendidos
        </div>

      </div>

      {/* 📍 LOCALIZAÇÃO */}
      <div className="bg-white max-w-xl w-full mt-8 p-6 rounded-2xl shadow text-center">

        <h2 className="font-semibold text-lg mb-2 text-gray-800">
          Onde estamos
        </h2>

        <p className="text-gray-600 mb-4">
          📍 Rua Exemplo, 123 - São Paulo
        </p>

        <iframe
          src="https://www.google.com/maps?q=São+Paulo&output=embed"
          className="w-full h-48 rounded-lg"
        ></iframe>

      </div>

    </main>
  );
}