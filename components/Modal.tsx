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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`bg-white border border-slate-200 rounded-2xl w-full shadow-xl flex flex-col max-h-[90vh] ${maxWidth}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
