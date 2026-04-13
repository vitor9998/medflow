import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Clínica Saúde+",
  description: "Sistema para organização de consultórios médicos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-[#020617] text-white">

        {/* NAVBAR GLOBAL */}
        <Navbar />

        {/* CONTEÚDO DAS PÁGINAS */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}