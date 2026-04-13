"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  MessageCircle, 
  Settings, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { MedsysLogo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Impede o scroll de fundo (bleed) quando o menu mobile está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/admin/pacientes", label: "Pacientes", icon: Users },
    { href: "/admin/comunicacao", label: "Comunicação", icon: MessageCircle },
    { href: "/admin/config", label: "Configurações", icon: Settings },
  ];

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Topbar & Hamburger */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B1120] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2 text-white font-bold text-lg tracking-tight">
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-lg border border-white/10 flex items-center justify-center">
             <MedsysLogo className="h-5 w-auto" />
          </div>
          Medsys
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed text-white inset-y-0 left-0 z-50 w-64 bg-[#020617] md:bg-transparent md:border-r border-gray-800/60
        transform transition-transform duration-200 ease-in-out md:static md:translate-x-0
        flex flex-col p-4 overflow-y-auto overscroll-contain
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
         <div className="hidden md:flex items-center gap-3 mb-10 px-2 mt-2 font-bold text-xl tracking-tight text-white">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 shadow-lg flex items-center justify-center">
              <MedsysLogo className="h-6 w-auto" />
            </div>
            <span>Medsys</span>
         </div>

         <nav className="flex flex-col gap-1.5 mt-4 md:mt-0">
           {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              )
           })}
         </nav>
         
         <div className="mt-auto pt-6 pb-2 border-t border-gray-800/60 flex flex-col">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full text-left"
           >
             <LogOut className="w-5 h-5" />
             Sair da Conta
           </button>
         </div>
      </aside>
    </>
  );
}
