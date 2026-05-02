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
import { ZyntraLogo } from "@/components/Logo";
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
    { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  ];

  // Secretária vê agenda multi-médicos, médico vê agenda própria
  if (role === "secretaria") {
    baseLinks.push({ href: "/admin/secretaria", label: "Agenda Central", icon: CalendarRange });
  } else {
    baseLinks.push({ href: "/admin/agenda", label: "Minha Agenda", icon: CalendarDays });
  }

  baseLinks.push(
    { href: "/admin/pacientes", label: "Pacientes", icon: Users },
    { href: "/admin/comunicacao", label: "Comunicações", icon: MessageCircle },
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
      <div className="md:hidden flex items-center justify-between px-6 py-4 bg-[#FDFCF8] border-b border-stone-200/50 shrink-0">
        <div className="flex items-center gap-3 text-stone-900 font-semibold tracking-tight">
          <ZyntraLogo className="h-5 w-auto text-emerald-900" />
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-10 h-10 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-[#FDFCF8] md:border-r border-stone-200/50
        transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0
        flex flex-col overflow-y-auto overscroll-contain
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="hidden md:flex items-center gap-3 px-8 pt-8 pb-10">
          <ZyntraLogo className="h-6 w-auto text-emerald-900" />
        </div>

        {/* Section label */}
        <div className="px-8 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
            Navegação
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4 mt-1 md:mt-0">
          {links.map((link: any) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={closeSidebar}
                className={`
                  group flex items-center gap-4 px-4 py-3 rounded-2xl text-[13px] font-medium
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                  ${isActive 
                    ? "bg-emerald-900/5 text-emerald-900 font-bold" 
                    : "text-stone-500 hover:text-stone-900 hover:bg-stone-100/50"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-900" : "text-stone-400 group-hover:text-stone-900"} transition-colors`} strokeWidth={isActive ? 2 : 1.5} />
                {link.label}
              </Link>
            )
          })}
        </nav>
         
        {/* Footer */}
        <div className="mt-auto px-4 pb-6 pt-6">
          <div className="border-t border-stone-200/50 pt-4 px-2">
            <button 
              onClick={handleLogout}
              className="
                group flex items-center gap-4 py-3 rounded-2xl text-[13px] font-semibold tracking-wide
                transition-all duration-300 ease-out w-full text-left
                text-stone-400 hover:text-red-700
              "
            >
              <LogOut className="w-5 h-5 text-stone-300 group-hover:text-red-700 transition-colors" strokeWidth={1.5} />
              Encerrar Sessão
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
