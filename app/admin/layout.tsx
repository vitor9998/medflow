import { Sidebar } from "@/components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#020617] text-slate-200 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
