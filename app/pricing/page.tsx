import Link from "next/link";

export default function PricingPage() {
  return (
    <main className="bg-[#020617] text-white min-h-screen py-20 px-6">

      {/* TÍTULO */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Planos simples e transparentes
        </h1>
        <p className="text-gray-400">
          Escolha o melhor plano para o seu consultório
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

        {/* BÁSICO */}
        <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Básico</h2>

          <p className="text-3xl font-bold mb-6">
            R$29<span className="text-sm text-gray-400">/mês</span>
          </p>

          <ul className="space-y-3 text-gray-400 mb-8">
            <li>✔ Agenda simples</li>
            <li>✔ Confirmação manual</li>
            <li>✔ WhatsApp básico</li>
          </ul>

          <Link
            href="/admin"
            className="block w-full text-center bg-gray-700 py-3 rounded-xl"
          >
            Começar
          </Link>
        </div>

        {/* PROFISSIONAL */}
        <div className="bg-[#0B1120] border-2 border-green-500 rounded-2xl p-8 scale-105">

          <p className="text-green-400 text-sm mb-2">
            MAIS ESCOLHIDO
          </p>

          <h2 className="text-xl font-semibold mb-4">
            Profissional
          </h2>

          <p className="text-4xl font-bold mb-6">
            R$59<span className="text-sm text-gray-400">/mês</span>
          </p>

          <ul className="space-y-3 text-gray-300 mb-8">
            <li>✔ Tudo do básico</li>
            <li>✔ Lembretes automáticos</li>
            <li>✔ Organização completa</li>
            <li>✔ Prioridade de atendimento</li>
          </ul>

          <Link
            href="/admin"
            className="block w-full text-center bg-green-500 hover:bg-green-600 py-3 rounded-xl font-semibold"
          >
            Começar agora
          </Link>
        </div>

        {/* PREMIUM */}
        <div className="bg-[#0B1120] border border-gray-800 rounded-2xl p-8">
          <h2 className="text-xl font-semibold mb-4">Premium</h2>

          <p className="text-3xl font-bold mb-6">
            R$99<span className="text-sm text-gray-400">/mês</span>
          </p>

          <ul className="space-y-3 text-gray-400 mb-8">
            <li>✔ Tudo do profissional</li>
            <li>✔ Suporte prioritário</li>
            <li>✔ Automações com IA</li>
          </ul>

          <Link
            href="/admin"
            className="block w-full text-center bg-gray-700 py-3 rounded-xl"
          >
            Começar
          </Link>
        </div>

      </div>

      {/* CTA FINAL */}
      <div className="text-center mt-20">
        <p className="text-gray-400 mb-4">
          Teste grátis por 7 dias. Sem compromisso.
        </p>

        <Link
          href="/admin"
          className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-xl font-semibold"
        >
          Criar conta grátis
        </Link>
      </div>

    </main>
  );
}