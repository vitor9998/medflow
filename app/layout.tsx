import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#020617] text-white">

        {/* HEADER */}
        <div className="w-full flex justify-between items-center px-8 py-4 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <h1 className="font-bold">Clínica Saúde+</h1>

          <div className="flex gap-6 text-sm text-gray-300">
            <a href="/">Home</a>
            <a href="/agendamento">Agendar</a>
            <a href="/admin">Admin</a>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}