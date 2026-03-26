"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle, Facebook, Video, Globe, MapPin, DollarSign, GripVertical, Plus, TrendingUp, Sparkles, Calendar } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NewLeadModal } from "./NewLeadModal";
import { AiMatchModal } from "./AiMatchModal";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, getDoc } from "firebase/firestore";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LeadOrigin = "whatsapp" | "meta" | "tiktok" | "website";
type LeadStatus = "nova" | "contato" | "visita" | "proposta" | "fechado";

interface Lead {
  id: string;
  name: string;
  origin: LeadOrigin;
  property: string;
  value: number;
  status: LeadStatus;
  createdAt: Date;
  phone?: string;
}

const mockLeads: Lead[] = [
  { id: "1", name: "Lucas Mello", origin: "whatsapp", property: "Apt 2Qtos - Vila Clê", value: 3500, status: "nova", createdAt: new Date() },
  { id: "2", name: "Mariana Souza", origin: "tiktok", property: "Casa Cond. Alphaville", value: 1250000, status: "contato", createdAt: new Date(Date.now() - 86400000) },
  { id: "3", name: "Roberto Alves", origin: "meta", property: "Cobertura Leblon", value: 8500, status: "visita", createdAt: new Date(Date.now() - 172800000) },
  { id: "4", name: "Ana Clara", origin: "website", property: "Studio Centro", value: 450000, status: "proposta", createdAt: new Date(Date.now() - 259200000) },
];

const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: "nova", title: "Novos Leads", color: "bg-blue-500" },
  { id: "contato", title: "Em Contato", color: "bg-yellow-500" },
  { id: "visita", title: "Visita Agendada", color: "bg-purple-500" },
  { id: "proposta", title: "Proposta", color: "bg-orange-500" },
  { id: "fechado", title: "Fechado", color: "bg-emerald-500" },
];

const originIcons: Record<LeadOrigin, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-4 h-4 text-emerald-400" />,
  meta: <Facebook className="w-4 h-4 text-blue-500" />,
  tiktok: <Video className="w-4 h-4 text-pink-500" />,
  website: <Globe className="w-4 h-4 text-neutral-400" />,
};

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiMatchTarget, setAiMatchTarget] = useState<Lead | null>(null);
  const [calendlyLink, setCalendlyLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Carrega o perfil da agência para pegar o link de agendamento
    getDoc(doc(db, "agencies", auth.currentUser.uid)).then((docSnap) => {
      if (docSnap.exists()) {
        setCalendlyLink(docSnap.data().calendlyLink || null);
      }
    }).catch(console.error);
    
    // Filtra Leads APENAS da agência locada atualmente (SaaS Multi-Tenant)
    const q = query(
      collection(db, "leads"),
      where("agencyId", "==", auth.currentUser.uid)
    );
    
    // Escuta em Tempo-Real por mudanças na Nuvem
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      // Ordenar do mais novo para o mais antigo por segurança no frontend
      fetchedLeads.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLeads(fetchedLeads);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: LeadStatus) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    // UI Otimista (Muda instantâneo)
    setLeads((prev) => 
      prev.map((lead) => 
        lead.id === draggedLeadId ? { ...lead, status: targetStatus } : lead
      )
    );

    // Salva na Nuvem silenciosamente
    try {
      const leadRef = doc(db, "leads", draggedLeadId);
      await updateDoc(leadRef, { status: targetStatus });
    } catch (e) {
      console.error(e);
    }
    
    setDraggedLeadId(null);
  };

  const handleAddLead = async (data: any) => {
    if (!auth.currentUser) return;
    try {
      await addDoc(collection(db, "leads"), {
        ...data,
        status: "nova",
        agencyId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar lead:", error);
      alert("Operação bloqueada: Lembre-se de liberar regra de Escrita no FIRESTORE RULES na sua conta Firebase.");
    }
  };

  // Metrics Calculation
  const totalValue = leads.filter(l => l.status === "fechado").reduce((acc, curr) => acc + curr.value, 0);
  const activeLeads = leads.filter(l => l.status !== "fechado").length;

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Metrics Row */}
      <div className="flex items-center justify-between bg-[#141414] border border-neutral-800/80 rounded-2xl p-4 shrink-0 shadow-sm">
        <div className="flex gap-8 px-4">
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Total em Vendas</p>
            <p className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalValue)}
            </p>
          </div>
          <div className="w-px bg-neutral-800"></div>
          <div>
            <p className="text-neutral-500 text-xs font-semibold uppercase tracking-wider mb-1">Leads Ativos no Funil</p>
            <p className="text-2xl font-bold text-neutral-100">{activeLeads}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_-3px_rgba(245,158,11,0.6)] hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Novo Lead
        </button>
      </div>

      {/* Kanban Scroll Area */}
      {/* Loading State Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm z-50 flex flex-col items-center pt-32 rounded-xl">
           <div className="w-10 h-10 border-4 border-neutral-800 border-t-amber-500 rounded-full animate-spin"></div>
           <p className="mt-3 text-amber-500 font-bold text-xs uppercase tracking-widest">Puxando Leads Criptografados...</p>
        </div>
      )}

      <div className="flex gap-6 h-full overflow-x-auto pb-4 items-start relative min-h-[500px]">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => l.status === col.id);
          
          return (
            <div 
              key={col.id} 
              className="flex flex-col w-[320px] shrink-0 bg-[#0f0f0f]/80 backdrop-blur-sm rounded-xl border border-neutral-800/50 h-full overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="p-4 border-b border-neutral-800/50 flex items-center justify-between sticky top-0 bg-[#0f0f0f] z-10">
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-current", col.color)} />
                  <h3 className="font-semibold text-neutral-200 text-sm tracking-wide">{col.title}</h3>
                </div>
                <span className="bg-neutral-800/80 text-neutral-400 text-xs py-0.5 px-2.5 rounded-md font-medium">
                  {columnLeads.length}
                </span>
              </div>

              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={cn(
                      "bg-[#1a1a1a] border border-neutral-800 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-amber-500/30 transition-all group",
                      draggedLeadId === lead.id && "opacity-50 scale-95"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#262626] p-1.5 rounded-lg border border-neutral-700/50" title={`Origem: ${lead.origin}`}>
                          {originIcons[lead.origin]}
                        </div>
                        <h4 className="font-medium text-neutral-100 text-sm">{lead.name}</h4>
                      </div>
                      <GripVertical className="w-4 h-4 text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-neutral-400 text-xs">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{lead.property}</span>
                      </div>
                      <div className="flex items-center gap-2 text-neutral-400 text-xs font-medium">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.value)}
                      </div>
                    </div>

                    <div className="text-[10px] text-neutral-500 pt-3 border-t border-neutral-800/50 flex justify-between items-center">
                      <span>Ad. {format(new Date(lead.createdAt), "dd MMM", { locale: ptBR })}</span>
                      <div className="flex gap-1.5">
                        {lead.phone && (
                          <a 
                            href={`https://wa.me/${lead.phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(lead.name.split(' ')[0])},%20tudo%20bem%3F`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chamar no WhatsApp"
                            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-1 rounded transition-colors"
                          >
                            <MessageCircle className="w-3 h-3" />
                            Whats
                          </a>
                        )}
                        {calendlyLink && (
                          <a 
                            href={calendlyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Agendar Reunião via Calendly"
                            className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded transition-colors"
                          >
                            <Calendar className="w-3 h-3" />
                            Agendar
                          </a>
                        )}
                        <button 
                          onClick={() => setAiMatchTarget(lead)}
                          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded transition-colors"
                        >
                          <Sparkles className="w-3 h-3" />
                          Match
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {columnLeads.length === 0 && (
                  <div className="h-24 flex items-center justify-center border-2 border-dashed border-neutral-800/50 rounded-xl m-1">
                    <span className="text-neutral-500 text-xs font-medium">Solte o lead aqui</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <NewLeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleAddLead} 
      />

      <AiMatchModal 
        lead={aiMatchTarget}
        onClose={() => setAiMatchTarget(null)}
      />
    </div>
  );
}
