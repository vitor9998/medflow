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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "superadmin") {
        router.push("/admin");
        return;
      }

      const { data: docs, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "doctor");

      if (!error && docs) {
        setMedicos(docs);
      }

      const { data: secs, error: secErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "secretaria");

      if (!secErr && secs) {
        setSecretarias(secs);
      }

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
        prev.map((m: any) => m.id === id ? { ...m, status: novoStatus } : m)
      );
    } else {
      setMedicos((prev) => 
        prev.map((m: any) => m.id === id ? { ...m, status: novoStatus } : m)
      );
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 md:p-10 flex flex-col min-h-full max-w-7xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200">
               <ShieldAlert className="w-5 h-5 text-amber-500" />
             </div>
             Painel Master
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Controle unificado de acessos e liberacao de perfis.</p>
        </div>
      </div>

      {/* MEDICOS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
           <UserSearch className="w-4 h-4 text-blue-500" />
           <h2 className="font-semibold text-sm text-slate-800">Medicos Cadastrados <span className="text-slate-400 font-mono text-xs">({medicos.length})</span></h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
          {medicos.length === 0 ? (
            <p className="text-slate-400 text-center py-10 text-sm">Nenhum medico encontrado.</p>
          ) : (
            medicos.map((medico: any) => (
              <div key={medico.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all hover:border-slate-300">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2.5 mb-0.5">
                     <span className="text-sm font-bold text-slate-800">{medico.nome}</span>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                       medico.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                       medico.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                       'bg-red-50 text-red-600 border border-red-200'
                     }`}>
                       {medico.status}
                     </span>
                   </div>
                   <p className="text-xs text-slate-500">{medico.email}</p>
                   <p className="text-[10px] text-slate-400 mt-0.5 font-mono">/{medico.slug}</p>
                </div>

                <div className="flex items-center gap-2">
                   {medico.status !== 'active' && (
                     <button
                       onClick={() => updateStatus(medico.id, 'active')}
                       className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3.5 py-2 rounded-lg text-xs font-semibold transition border border-emerald-200"
                     >
                       <UserCheck className="w-3.5 h-3.5" /> Aprovar
                     </button>
                   )}
                   {medico.status !== 'suspended' && (
                     <button
                       onClick={() => updateStatus(medico.id, 'suspended')}
                       className="flex items-center gap-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                     >
                       <UserX className="w-3.5 h-3.5" /> Bloquear
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
         </div>
      </div>

      {/* SECRETARIAS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
           <ClipboardList className="w-4 h-4 text-amber-500" />
           <h2 className="font-semibold text-sm text-slate-800">Secretarias Cadastradas <span className="text-slate-400 font-mono text-xs">({secretarias.length})</span></h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
          {secretarias.length === 0 ? (
            <p className="text-slate-400 text-center py-10 text-sm">Nenhuma secretaria encontrada.</p>
          ) : (
            secretarias.map((sec: any) => (
              <div key={sec.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 transition-all hover:border-slate-300">
                <div className="flex flex-col">
                   <div className="flex items-center gap-2.5 mb-0.5">
                     <span className="text-sm font-bold text-slate-800">{sec.nome}</span>
                     <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                       sec.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                       sec.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                       'bg-red-50 text-red-600 border border-red-200'
                     }`}>
                       {sec.status}
                     </span>
                   </div>
                   <p className="text-xs text-slate-500">{sec.email}</p>
                   <p className="text-[10px] text-slate-400 mt-0.5">
                     Medicos vinculados: {sec.medicos_ids?.length || 0}
                   </p>
                </div>

                <div className="flex items-center gap-2">
                   {sec.status !== 'active' && (
                     <button
                       onClick={() => updateStatus(sec.id, 'active', 'secretaria')}
                       className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 px-3.5 py-2 rounded-lg text-xs font-semibold transition border border-emerald-200"
                     >
                       <UserCheck className="w-3.5 h-3.5" /> Aprovar
                     </button>
                   )}
                   {sec.status !== 'suspended' && (
                     <button
                       onClick={() => updateStatus(sec.id, 'suspended', 'secretaria')}
                       className="flex items-center gap-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-500 px-3.5 py-2 rounded-lg text-xs font-semibold transition"
                     >
                       <UserX className="w-3.5 h-3.5" /> Bloquear
                     </button>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CLINICAS */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-500" />
            <h2 className="font-semibold text-sm text-slate-800">Clinicas <span className="text-slate-400 font-mono text-xs">({clinicas.length})</span></h2>
          </div>
          <button
            onClick={() => setShowNewClinic(!showNewClinic)}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Clinica
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]">
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
            }} className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Nome da clinica"
                  value={newClinicNome}
                  onChange={(e) => setNewClinicNome(e.target.value)}
                  required
                  className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none text-sm"
                />
                <input
                  placeholder="Codigo ex: MEDSYS-001"
                  value={newClinicCodigo}
                  onChange={(e) => setNewClinicCodigo(e.target.value)}
                  required
                  className="px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 outline-none text-sm uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={savingClinic}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {savingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Clinica
              </button>
            </form>
          )}

          {clinicas.length === 0 && !showNewClinic ? (
            <p className="text-slate-400 text-center py-10 text-sm">Nenhuma clinica cadastrada. Clique em "Nova Clinica" para criar.</p>
          ) : (
            clinicas.map((cl: any) => (
              <div key={cl.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-2 transition-all hover:border-slate-300">
                <div>
                  <p className="text-sm font-bold text-slate-800">{cl.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">
                      {cl.codigo}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(cl.codigo); }}
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
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
