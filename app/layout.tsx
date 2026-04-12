import "./globals.css";
import Navbar from "../components/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body className="bg-gray-100">

        <Navbar />

        {children}

        {/* WhatsApp fixo */}
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          WhatsApp
        </a>

      </body>
    </html>
  );
}