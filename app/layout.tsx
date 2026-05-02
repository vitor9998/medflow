import "./globals.css";

export const metadata = {
  title: "ZyntraMed — Gestão Inteligente para Clínicas e Consultórios",
  description: "Plataforma SaaS completa para médicos automatizarem consultas, organizarem atendimentos e aumentarem sua receita. Agendamento online, prontuário e automações.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#020617] text-white antialiased">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}