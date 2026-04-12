import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br">
      <body>

        {children}

        {/* 📲 BOTÃO WHATSAPP FIXO */}
        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            backgroundColor: "#25D366",
            color: "white",
            padding: "12px 16px",
            borderRadius: "50px",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
          }}
        >
          WhatsApp
        </a>

      </body>
    </html>
  );
}