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
  LogOut,
  ShieldAlert,
  CalendarRange
} from "lucide-react";
import { useState, useEffect } from "react";
import { MedsysLogo } from "@/components/Logo";
import { supabase } from "@/lib/supabaseClient";

export function Sidebar({ role }: { role?: string }) {
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

  const baseLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  ];

  // Secretária vê agenda multi-médicos, médico vê agenda própria
  if (role === "secretaria") {
    baseLinks.push({ href: "/admin/secretaria", label: "Agenda Multi-Médicos", icon: CalendarRange });
  } else {
    baseLinks.push({ href: "/admin/agenda", label: "Agenda", icon: CalendarDays });
  }

  baseLinks.push(
    { href: "/admin/pacientes", label: "Pacientes", icon: Users },
    { href: "/admin/comunicacao", label: "Comunicação", icon: MessageCircle },
  );

  // Só médico vê configurações do perfil
  if (role !== "secretaria") {
    baseLinks.push({ href: "/admin/config", label: "Configurações", icon: Settings });
  }

  const links = baseLinks;

  if (role === "superadmin") {
    links.push({ href: "/admin/master", label: "Painel Master", icon: ShieldAlert });
  }

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5 text-slate-900 font-semibold text-base tracking-tight">
          <div className="w-8 h-8 bg-blue-50 rounded-lg border border-blue-100 flex items-center justify-center">
             <MedsysLogo className="h-4 w-auto" />
          </div>
          Medsys
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[260px] bg-white md:border-r border-slate-200/80
        transform transition-transform duration-200 ease-in-out md:static md:translate-x-0
        flex flex-col overflow-y-auto overscroll-contain
        ${isOpen ? "translate-x-0 shadow-xl shadow-slate-900/5" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-6 pt-7 pb-8">
          <div className="w-9 h-9 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center">
            <MedsysLogo className="h-5 w-auto" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-slate-800">Medsys</span>
        </div>

        {/* Section label */}
        <div className="px-6 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-300">
            Menu
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-0.5 px-3 mt-1 md:mt-0">
          {links.map((link: any) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={closeSidebar}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150 ease-out
                  ${isActive 
                    ? "bg-blue-50/80 text-blue-600" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50/80"
                  }
                `}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                  transition-colors duration-150
                  ${isActive 
                    ? "bg-blue-100/60 text-blue-600" 
                    : "bg-transparent text-slate-400 group-hover:bg-slate-100/80 group-hover:text-slate-600"
                  }
                `}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                </div>
                {link.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </Link>
            )
          })}
        </nav>
         
        {/* Footer */}
        <div className="mt-auto px-3 pb-4 pt-4">
          <div className="border-t border-slate-100 pt-3">
            <button 
              onClick={handleLogout}
              className="
                group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                transition-all duration-150 ease-out w-full text-left
                text-slate-400 hover:text-red-500 hover:bg-red-50/60
              "
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-transparent group-hover:bg-red-100/50 transition-colors duration-150">
                <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </div>
              Sair da Conta
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
