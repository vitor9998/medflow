import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="bg-[#020617] text-white min-h-screen">

      {/* HERO */}
      <section className="text-center py-28 px-6">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Organize seu consultório <br />
          <span className="text-green-400">
            e reduza faltas automaticamente
          </span>
        </h1>

        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-lg">
          Agenda inteligente, confirmação automática e gestão completa de pacientes em um só lugar.
        </p>

        <div className="flex gap-4 justify-center">

          {/* 🔥 BOTÃO PRINCIPAL */}
          <Link
            href="/pricing"
            className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl font-semibold text-lg"
          >
            Testar grátis
          </Link>

          {/* 🔥 DEMO */}
          <Link
            href="/admin"
            className="border border-gray-600 px-8 py-4 rounded-xl text-lg"
          >
            Ver demonstração
          </Link>

        </div>
      </section>

      {/* MOCKUP */}
      <section className="px-6 mb-24">
        <div className="max-w-5xl mx-auto bg-[#0B1120] border border-gray-800 rounded-2xl p-4">
          <img
            src="/dashboard.png"
            alt="Sistema"
            className="rounded-xl"
          />
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="text-center py-20">
        <h2 className="text-3xl font-bold mb-6">
          Mais organização, menos faltas
        </h2>

        <div className="space-y-3 text-gray-400">
          <p>✔ Reduza faltas</p>
          <p>✔ Economize tempo</p>
          <p>✔ Tenha mais controle</p>
        </div>
      </section>

    </main>
  );
}