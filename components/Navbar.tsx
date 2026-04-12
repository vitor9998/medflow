"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-white shadow-sm px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-lg text-gray-800">
        Clínica Saúde+
      </h1>

      <div className="flex gap-4">
        <Link href="/" className="text-gray-600 hover:text-black">
          Home
        </Link>

        <Link href="/agendamento" className="text-gray-600 hover:text-black">
          Agendar
        </Link>

        <Link href="/admin" className="text-gray-600 hover:text-black">
          Admin
        </Link>
      </div>
    </nav>
  );
}