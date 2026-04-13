"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Modal } from "@/components/Modal";
import { Card } from "@/components/Card";
import { Users, Search, ChevronRight, FileText } from "lucide-react";

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

      (data || []).forEach((c) => {
        // Usar uma chave composta por nome e telefone provisoriamente
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
        
        // Atualizar ultima consulta se for mais recente (supondo ordem ISO YYYY-MM-DD descrescente no data default do Map e sort)
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
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pacientes</h1>
          <p className="text-slate-400 mt-1">Gerencie prontuários e histórico clínico.</p>
        </div>

        <div className="flex items-center gap-2 bg-[#0B1120] border border-gray-800 rounded-xl px-4 py-2 w-full md:w-80 shadow-sm focus-within:border-emerald-500/50 transition-colors">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar paciente..." 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-slate-600"
          />
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#0f172a] text-slate-400 font-medium border-b border-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-semibold">Nome Completo</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Contato</th>
                <th className="px-6 py-4 font-semibold hidden lg:table-cell">Última Consulta</th>
                <th className="px-6 py-4 font-semibold">Consultas</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 overflow-y-auto">
              {pacientesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum paciente encontrado.
                  </td>
                </tr>
              ) : (
                pacientesFiltrados.map((p, i) => (
                  <tr 
                    key={i} 
                    onClick={() => setSelecionado(p)}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                          {p.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{p.nome}</p>
                          <p className="text-xs text-slate-500 md:hidden">{p.telefone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-slate-300">{p.telefone}</p>
                      <p className="text-xs text-slate-500">{p.email || 'Sem email'}</p>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {p.ultimaConsulta.split('-').reverse().join('/')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-semibold">
                        {p.historico.length} {p.historico.length === 1 ? 'visita' : 'visitas'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 rounded-lg transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL DE PRONTUÁRIO */}
      <Modal 
        isOpen={!!selecionado} 
        onClose={() => setSelecionado(null)} 
        title="Prontuário Médico"
      >
        {selecionado && (
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Header do Prontuário */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-gray-800 mb-6 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
               <h2 className="text-xl font-bold text-white mb-1">{selecionado.nome}</h2>
               <div className="flex gap-4 text-sm text-slate-400 mt-2">
                 <span>📞 {selecionado.telefone}</span>
                 {selecionado.email && <span>✉️ {selecionado.email}</span>}
               </div>
            </div>

            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Histórico Clínico
            </h3>

            {/* Lista de Consultas */}
            <div className="space-y-6">
              {selecionado.historico.map((c: any) => (
                <div key={c.id} className="relative pl-6 border-l-2 border-gray-800 pb-2">
                  <div className="absolute w-3 h-3 bg-gray-800 rounded-full -left-[7px] top-1.5 border-2 border-[#0B1120]"></div>
                  
                  <div className="flex flex-col gap-1 mb-3">
                    <span className="text-sm font-semibold text-emerald-400">
                      📅 {c.data.split('-').reverse().join('/')} às {c.hora}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 w-fit">
                      {c.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-3 mt-4">
                    {c.sintomas && (
                      <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm text-slate-300">
                        <strong className="text-slate-400 block mb-1 text-xs">Sintomas / Motivo:</strong>
                        <p>{c.sintomas}</p>
                      </div>
                    )}

                    {c.resumo && (
                      <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-sm">
                        <strong className="text-blue-400 block mb-1 text-xs">Resumo Inteligente (IA):</strong>
                        <p className="text-slate-200">{c.resumo}</p>
                      </div>
                    )}

                    {/* Exibe Observações Médicas (se houver na base) */}
                    {c.observacoes && (
                      <div className="bg-slate-900 border border-gray-800 p-3 rounded-lg text-sm">
                        <strong className="text-slate-400 block mb-1 text-xs">Anotações da Consulta:</strong>
                        <p className="text-slate-300">{c.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}} />
          </div>
        )}
      </Modal>

    </div>
  );
}
