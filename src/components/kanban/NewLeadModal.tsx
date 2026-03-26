"use client";

import { useState, useEffect } from "react";
import { X, MessageCircle, Facebook, Video, Globe } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LeadOrigin = "whatsapp" | "meta" | "tiktok" | "website";

const origins: { id: LeadOrigin; label: string; icon: React.ReactNode; activeClass: string }[] = [
  { id: "whatsapp", label: "WhatsApp", icon: <MessageCircle className="w-5 h-5 mb-2" />, activeClass: "border-emerald-500 bg-emerald-500/10 text-emerald-400" },
  { id: "meta", label: "Insta/FB", icon: <Facebook className="w-5 h-5 mb-2" />, activeClass: "border-blue-500 bg-blue-500/10 text-blue-400" },
  { id: "tiktok", label: "TikTok", icon: <Video className="w-5 h-5 mb-2" />, activeClass: "border-pink-500 bg-pink-500/10 text-pink-400" },
  { id: "website", label: "Site/Outros", icon: <Globe className="w-5 h-5 mb-2" />, activeClass: "border-neutral-500 bg-neutral-500/10 text-neutral-300" },
];

export function NewLeadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState<LeadOrigin>("whatsapp");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [property, setProperty] = useState("");
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-new-lead", handleOpen);
    return () => window.removeEventListener("open-new-lead", handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    // Reset form on close
    setName("");
    setPhone("");
    setProperty("");
    setValue("");
    setOrigin("whatsapp");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !property || !phone || !auth.currentUser) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        name,
        phone,
        property,
        value: Number(value.replace(/\D/g, "")) || 0,
        origin,
        status: "nova",
        agencyId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      alert("Erro ao salvar o lead. Verifique as permissões ou tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#141414] border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-neutral-800/50 bg-[#0f0f0f]">
          <h2 className="text-xl font-bold text-neutral-100">Cadastrar Novo Lead</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-300">Origem do Contato</label>
            <div className="grid grid-cols-4 gap-3">
              {origins.map((o) => {
                const isActive = origin === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setOrigin(o.id)}
                    className={cn(
                      "flex flex-col items-center justify-center py-3 px-2 rounded-xl border border-neutral-800 transition-all font-medium text-xs",
                      isActive 
                        ? o.activeClass 
                        : "bg-[#0a0a0a] text-neutral-500 hover:border-neutral-600 hover:text-neutral-300 hover:bg-neutral-800/30"
                    )}
                  >
                    {o.icon}
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Nome do Lead</label>
                <input 
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Telefone (WhatsApp)</label>
                <input 
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-200"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Imóvel de Interesse</label>
                <input 
                  type="text"
                  required
                  value={property}
                  onChange={(e) => setProperty(e.target.value)}
                  placeholder="Ex: Apt 02 Centro"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Valor Opcional (R$)</label>
                <input 
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex: 350.000"
                  className="w-full bg-[#0a0a0a] border border-neutral-800 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)] flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Salvando...
                </>
              ) : "Salvar Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
