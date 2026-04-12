"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [agendamentos, setAgendamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchData()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
    }
  }

  const fetchData = async () => {
    const { data } = await supabase
      .from("agendamentos")
      .select("*")
      .order("created_at", { ascending: false })

    setAgendamentos(data || [])
    setLoading(false)
  }

  const deletar = async (id: string) => {
    await supabase.from("agendamentos").delete().eq("id", id)
    fetchData()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#1e293b] text-white p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <button
          onClick={logout}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          Sair
        </button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-2 gap-4 mb-8">

        <div className="bg-white/5 p-6 rounded-2xl">
          <p className="text-gray-400">Total</p>
          <h2 className="text-2xl font-bold">
            {agendamentos.length}
          </h2>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl">
          <p className="text-gray-400">Hoje</p>
          <h2 className="text-2xl font-bold">
            {
              agendamentos.filter((a) => {
                const hoje = new Date().toISOString().split("T")[0]
                return a.data === hoje
              }).length
            }
          </h2>
        </div>

      </div>

      {/* LISTA */}
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-4">

          {agendamentos.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 p-5 rounded-2xl flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-lg">{item.nome}</p>
                <p className="text-sm text-gray-400">{item.email}</p>
                <p className="text-sm">📅 {item.data}</p>
              </div>

              <button
                onClick={() => deletar(item.id)}
                className="bg-red-500 px-4 py-2 rounded-lg"
              >
                Excluir
              </button>
            </div>
          ))}

        </div>
      )}
    </div>
  )
}