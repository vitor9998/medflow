export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Dr. João Silva</h1>
      <h2>Clínico Geral</h2>

      <p>
        Atendimento humanizado com foco na sua saúde e bem-estar.
      </p>

      <a href="/agendamento">
        <button
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Agendar Consulta
        </button>
      </a>
    </main>
  );
}