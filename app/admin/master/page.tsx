"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ShieldAlert, Loader2, UserCheck, UserX, UserSearch, ClipboardList, Building2, Plus, Copy } from "lucide-react";

export default function MasterPanelPage() {
  const router = useRouter();
  const [medicos, setMedicos] = useState<any[]>([]);
  const [secretarias, setSecretarias] = useState<any[]>([]);
  const [clinicas, setClinicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create clinic form
  const [showNewClinic, setShowNewClinic] = useState(false);
  const [newClinicNome, setNewClinicNome] = useState("");
  const [newClinicCodigo, setNewClinicCodigo] = useState("");
  const [savingClinic, setSavingClinic] = useState(false);

  useEffect(() => {
    async function loadData() {
      // 1. Double check RBAC
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "superadmin") {
        router.push("/admin"); // Kickout if trying to bypass
        return;
      }

      // 2. Fetch Doctors
      const { data: docs, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "doctor");

      if (error) {
        console.error("ERRO FETCH MEDICOS:", error);
      }

      if (!error && docs) {
        setMedicos(docs);
      }

      // 3. Fetch Secretaries
      const { data: secs, error: secErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "secretaria");

      if (!secErr && secs) {
        setSecretarias(secs);
      }

      // 4. Fetch Clinics
      const { data: cls } = await supabase
        .from("clinicas")
        .select("*")
        .order("created_at", { ascending: false });

      if (cls) setClinicas(cls);

      setLoading(false);
    }
    loadData();
  }, [router]);

  async function updateStatus(id: string, novoStatus: string, tipo: "medico" | "secretaria" = "medico") {
    const { error } = await supabase
      .from("profiles")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar o status.");
      return;
    }

    if (tipo === "secretaria") {
      setSecretarias((prev) => 
        prev.map(m => m.id === id ? { ...m, status: novoStatus } : m)
      );
    } else {
      setMedicos((prev) => 
        prev.map(m => m.id === id ? { ...m, status: novoStatus } : m)
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-10 flex flex-col h-full max-w-7xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
             <ShieldAlert className="w-8 h-8 text-yellow-500" />
             Painel Master (Superadmin)
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">Controle unificado de acessos e liberação de perfis da plataforma.</p>
        </div>
      </div>

      <div className="bg-[#0B1120] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        {/* Table / List */}
        <div className="p-6 border-b border-gray-800/50 bg-[#020617]/50 flex items-center gap-2">
           <UserSearch className="w-5 h-5 text-emerald-500" />
           <h2 className="font-semibold text-white">Médicos Cadastrados ({medicos.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {medicos.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Nenhum médico encontrado no banco de dados.</p>
          ) : (
            medicos.map((medico) => (
              <div key={medico.id} className="bg-[#020617] border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-gray-700">
                <div className="flex flex-col">
                   <div className="flex items-center gap-3 mb-1">
                     <span className="text-lg font-bold text-white">{medico.nome}</span>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                       medico.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                       medico.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                       'bg-red-500/20 text-red-500 border border-red-500/30'
                     }`}>
                       {medico.status}
                     </span>
                   </div>
                   <p className="text-sm text-slate-400">{medico.email}</p>
                   <p className="text-xs text-slate-500 mt-1 font-mono">Slug/Link: /{medico.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                   {medico.status !== 'active' && (
                     <button
                       onClick={() => updateStatus(medico.id, 'active')}
                       className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                     >
                       <UserCheck className="w-4 h-4" /> Aprovar
                     </button>
                   )}
                   {medico.status !== 'suspended' && (
                     <button
                       onClick={() => updateStatus(medico.id, 'suspended')}
                       className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold transition"
                     >
                       <UserX className="w-4 h-4" /> Bloquear
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
         </div>
      </div>

      {/* SECRETÁRIAS */}
      <div className="bg-[#0B1120] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col mt-8">
        <div className="p-6 border-b border-gray-800/50 bg-[#020617]/50 flex items-center gap-2">
           <ClipboardList className="w-5 h-5 text-amber-500" />
           <h2 className="font-semibold text-white">Secretárias Cadastradas ({secretarias.length})</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {secretarias.length === 0 ? (
            <p className="text-slate-500 text-center py-10">Nenhuma secretária encontrada no banco de dados.</p>
          ) : (
            secretarias.map((sec) => (
              <div key={sec.id} className="bg-[#020617] border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-all hover:border-gray-700">
                <div className="flex flex-col">
                   <div className="flex items-center gap-3 mb-1">
                     <span className="text-lg font-bold text-white">{sec.nome}</span>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                       sec.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                       sec.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' :
                       'bg-red-500/20 text-red-500 border border-red-500/30'
                     }`}>
                       {sec.status}
                     </span>
                   </div>
                   <p className="text-sm text-slate-400">{sec.email}</p>
                   <p className="text-xs text-slate-500 mt-1">
                     Médicos vinculados: {sec.medicos_ids?.length || 0}
                   </p>
                </div>

                <div className="flex items-center gap-2">
                   {sec.status !== 'active' && (
                     <button
                       onClick={() => updateStatus(sec.id, 'active', 'secretaria')}
                       className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                     >
                       <UserCheck className="w-4 h-4" /> Aprovar
                     </button>
                   )}
                   {sec.status !== 'suspended' && (
                     <button
                       onClick={() => updateStatus(sec.id, 'suspended', 'secretaria')}
                       className="flex items-center gap-2 bg-slate-800 hover:bg-red-500/20 border border-transparent hover:border-red-500/30 text-slate-300 hover:text-red-400 px-4 py-2 rounded-xl text-sm font-semibold transition"
                     >
                       <UserX className="w-4 h-4" /> Bloquear
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CLÍNICAS */}
      <div className="bg-[#0B1120] border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col mt-8">
        <div className="p-6 border-b border-gray-800/50 bg-[#020617]/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-white">Clínicas ({clinicas.length})</h2>
          </div>
          <button
            onClick={() => setShowNewClinic(!showNewClinic)}
            className="flex items-center gap-1.5 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nova Clínica
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Create clinic form */}
          {showNewClinic && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSavingClinic(true);
              const { data, error } = await supabase
                .from("clinicas")
                .insert([{ nome: newClinicNome, codigo: newClinicCodigo.toUpperCase() }])
                .select()
                .single();

              if (error) {
                alert(`Erro: ${error.message}`);
              } else if (data) {
                setClinicas(prev => [data, ...prev]);
                setNewClinicNome("");
                setNewClinicCodigo("");
                setShowNewClinic(false);
              }
              setSavingClinic(false);
            }} className="bg-[#020617] border border-emerald-500/30 p-5 rounded-2xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Nome da clínica"
                  value={newClinicNome}
                  onChange={(e) => setNewClinicNome(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl bg-[#0B1120] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-sm"
                />
                <input
                  placeholder="Código (único) ex: MEDSYS-001"
                  value={newClinicCodigo}
                  onChange={(e) => setNewClinicCodigo(e.target.value)}
                  required
                  className="px-4 py-3 rounded-xl bg-[#0B1120] border border-gray-800 text-white placeholder-slate-500 focus:border-emerald-500 outline-none text-sm uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={savingClinic}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
              >
                {savingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Clínica
              </button>
            </form>
          )}

          {clinicas.length === 0 && !showNewClinic ? (
            <p className="text-slate-500 text-center py-10">Nenhuma clínica cadastrada. Clique em "Nova Clínica" para criar.</p>
          ) : (
            clinicas.map((cl) => (
              <div key={cl.id} className="bg-[#020617] border border-gray-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all hover:border-gray-700">
                <div>
                  <p className="text-lg font-bold text-white">{cl.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                      {cl.codigo}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(cl.codigo); alert(`Código "${cl.codigo}" copiado!`); }}
                      className="text-slate-500 hover:text-emerald-400 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Criada em {new Date(cl.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
