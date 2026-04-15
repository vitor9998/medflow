import "./globals.css";

export const metadata = {
  title: "Medsys — Gestão Inteligente para Clínicas e Consultórios",
  description: "Plataforma SaaS completa para médicos automatizarem consultas, organizarem atendimentos e aumentarem sua receita. Agendamento online, prontuário e automações.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#020617] text-white">

        {/* CONTEÚDO DAS PÁGINAS */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}