"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";
import { Card } from "@/components/Card";
import { Users, Search, ChevronRight, FileText, Phone, Mail } from "lucide-react";

export default function PacientesPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [selecionado, setSelecionado] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      fetchAgendamentos(user.id);
    }
    init();
  }, []);

  async function fetchAgendamentos(userId: string) {
    const { data, error } = await supabase
      .from("agendamentos")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });

    if (error) {
      console.log("Erro ao buscar contatos", error);
    } else {
      // Agrupar agendamentos por paciente
      const pacMap = new Map();

      (data || []).forEach((c: any) => {
        const key = `${c.nome?.trim().toLowerCase()}-${c.telefone}`;
        if (!pacMap.has(key)) {
          pacMap.set(key, {
            nome: c.nome,
            email: c.email,
            telefone: c.telefone,
            primeiraConsulta: c.data,
            ultimaConsulta: c.data,
            historico: [],
          });
        }
        
        const paciente = pacMap.get(key);
        paciente.historico.push(c);
        
        if (c.data > paciente.ultimaConsulta) paciente.ultimaConsulta = c.data;
        if (c.data < paciente.primeiraConsulta) paciente.primeiraConsulta = c.data;
      });

      setPacientes(Array.from(pacMap.values()));
    }
    setIsLoading(false);
  }

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome?.toLowerCase().includes(filtro.toLowerCase()) || 
    p.email?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie prontuarios e historico clinico.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 w-full md:w-72 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar paciente..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Nome</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Contato</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Ultima Consulta</th>
                <th className="px-5 py-3 font-semibold text-xs uppercase tracking-wider">Consultas</th>
                <th className="px-5 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Nenhum paciente encontrado</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((p, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelecionado(p)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xs">
                          {p.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-800 font-semibold text-sm">{p.nome}</p>
                          <p className="text-xs text-slate-400 md:hidden">{p.telefone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-slate-600 text-sm">{p.telefone}</p>
                      <p className="text-xs text-slate-400">{p.email || 'Sem email'}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-sm">
                      {p.ultimaConsulta.split('-').reverse().join('/')}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {p.historico.length} {p.historico.length === 1 ? 'visita' : 'visitas'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="p-1.5 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL DE PRONTUARIO */}
      <Modal 
        isOpen={!!selecionado} 
        onClose={() => setSelecionado(null)} 
        title="Prontuario Medico"
      >
        {selecionado && (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {/* Header */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-5 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
               <h2 className="text-lg font-bold text-slate-800 mb-1 pl-3">{selecionado.nome}</h2>
               <div className="flex gap-4 text-sm text-slate-500 mt-1 pl-3">
                 <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selecionado.telefone}</span>
                 {selecionado.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selecionado.email}</span>}
               </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Historico Clinico
            </h3>

            {/* Timeline */}
            <div className="space-y-5">
              {selecionado.historico.map((c: any) => (
                <div key={c.id} className="relative pl-5 border-l-2 border-slate-200 pb-2">
                  <div className="absolute w-2.5 h-2.5 bg-blue-400 rounded-full -left-[6px] top-1.5"></div>
                  
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-sm font-semibold text-slate-700">
                      {c.data.split('-').reverse().join('/')} as {c.hora}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                      c.status === "confirmado" ? "bg-emerald-50 text-emerald-600" :
                      c.status === "cancelado" ? "bg-red-50 text-red-600" :
                      c.status === "presente" ? "bg-sky-50 text-sky-600" :
                      "bg-amber-50 text-amber-600"
                    }`}>
                      {c.status?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {c.sintomas && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-600">
                        <strong className="text-slate-500 block mb-1 text-xs">Motivo da consulta:</strong>
                        <p>{c.sintomas}</p>
                      </div>
                    )}

                    {c.observacoes_paciente && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm text-slate-500">
                        <strong className="text-slate-400 block mb-1 text-xs">Observacoes do paciente:</strong>
                        <p>{c.observacoes_paciente}</p>
                      </div>
                    )}

                    {c.resumo && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
                        <strong className="text-blue-600 block mb-1 text-xs">Resumo Inteligente (IA):</strong>
                        <p className="text-slate-700">{c.resumo}</p>
                      </div>
                    )}

                    {c.observacoes && (
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm">
                        <strong className="text-slate-500 block mb-1 text-xs">Anotacoes da Consulta:</strong>
                        <p className="text-slate-600">{c.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
