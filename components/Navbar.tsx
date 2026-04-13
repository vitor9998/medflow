"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#020617] border-b border-gray-800 px-6 py-4 flex justify-between items-center">

      {/* LOGO */}
      <h1 className="font-bold text-lg text-white">
        Clínica Saúde+
      </h1>

      {/* LINKS */}
      <div className="flex gap-6 items-center text-gray-300">

        <Link href="/" className="hover:text-white transition">
          Home
        </Link>

        <Link href="/pricing" className="hover:text-white transition">
          Preços
        </Link>

        <Link href="/agendamento" className="hover:text-white transition">
          Agendar
        </Link>

        <Link href="/admin" className="hover:text-white transition">
          Admin
        </Link>

        {/* CTA (IMPORTANTE PRA VENDER) */}
        <Link
          href="/pricing"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold transition"
        >
          Começar
        </Link>

      </div>
    </nav>
  );
}