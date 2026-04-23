"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-md" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`
          bg-white border border-slate-200/80 w-full shadow-[0_20px_60px_-10px_rgba(15,23,42,0.18),0_8px_20px_-6px_rgba(15,23,42,0.10)]
          flex flex-col max-h-[92dvh] animate-fade-in-up
          rounded-t-3xl sm:rounded-2xl ${maxWidth}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          {/* Mobile drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-200 sm:hidden" />
          <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
