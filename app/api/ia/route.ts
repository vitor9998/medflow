import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sintomas } = body

    if (!sintomas) {
      return NextResponse.json(
        { error: "Sem sintomas" },
        { status: 400 }
      )
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente médico. Resuma sintomas de forma clara, objetiva e profissional.",
          },
          {
            role: "user",
            content: sintomas,
          },
        ],
        max_tokens: 150,
      }),
    })

    const data = await response.json()

    // 🔥 DEBUG
    console.log("OPENAI RESPONSE:", JSON.stringify(data, null, 2))

    if (!response.ok) {
      return NextResponse.json(
        { error: "Erro na IA", detalhe: data },
        { status: 500 }
      )
    }

    const resumo =
      data?.choices?.[0]?.message?.content ||
      "Não foi possível gerar resumo"

    return NextResponse.json({ resumo })

  } catch (error) {
    console.error("ERRO:", error)

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    )
  }
}