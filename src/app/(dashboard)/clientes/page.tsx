"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, MapPin, MessageCircle, Facebook, Video, Globe, Copy, Mail, Phone, ChevronRight } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

type LeadOrigin = "whatsapp" | "meta" | "tiktok" | "website";
type LeadStatus = "nova" | "contato" | "visita" | "proposta" | "fechado";

interface Lead {
  id: string;
  name: string;
  origin: LeadOrigin;
  property: string;
  value: number;
  status: LeadStatus;
  createdAt: string;
  phone?: string;
  email?: string;
}

const statusColors: Record<LeadStatus, string> = {
  nova: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contato: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  visita: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  proposta: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  fechado: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

const statusTitles: Record<LeadStatus, string> = {
  nova: "Novo Lead",
  contato: "Contatado",
  visita: "Visita Agendada",
  proposta: "Em Proposta",
  fechado: "Vencido",
};

const originIcons: Record<LeadOrigin, React.ReactNode> = {
  whatsapp: <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />,
  meta: <Facebook className="w-3.5 h-3.5 text-blue-500" />,
  tiktok: <Video className="w-3.5 h-3.5 text-pink-500" />,
  website: <Globe className="w-3.5 h-3.5 text-neutral-400" />,
};

export default function ClientesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!auth.currentUser) return;
    
    // Filtra Leads da agência locada atualmente
    const q = query(
      collection(db, "leads"),
      where("agencyId", "==", auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLeads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Lead[];
      
      fetchedLeads.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setLeads(fetchedLeads);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    lead.property.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-3 tracking-wide">
            Base de Clientes
            <span className="text-xs bg-amber-500/10 text-amber-500 px-2.5 py-1 rounded-md font-medium border border-amber-500/20">
              {leads.length} Cadastros
            </span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Todos os leads que entraram no seu ecossistema formam o CRM.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou imóvel..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600 shadow-inner"
          />
        </div>
      </div>

      <div className="bg-[#0f0f0f]/80 backdrop-blur-sm border border-neutral-800/80 rounded-2xl flex-1 overflow-hidden shadow-xl flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-neutral-800 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="mt-3 text-neutral-500 text-xs font-medium uppercase tracking-widest">Sincronizando Módulo DRM...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-4 border border-neutral-800">
              <Search className="w-8 h-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-bold text-neutral-200 mb-1">Nenhum cliente encontrado</h3>
            <p className="text-neutral-500 text-sm max-w-sm">
              Sua equipe ainda não atraiu novos contatos ou nenhuma busca combina com os filtros.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto flex-1 h-full">
            <table className="w-full text-left border-collapse min-w-[800px] h-fit">
              <thead className="sticky top-0 bg-[#0f0f0f] z-10 border-b border-neutral-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Perfil de Interesse</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Estágio do Funil</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Origem do Tráfego</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Potencial de Venda</th>
                  <th className="px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50 text-sm">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#141414]/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-100 group-hover:text-amber-400 transition-colors">{lead.name}</span>
                        <div className="flex items-center gap-1.5 mt-1 text-neutral-500 text-xs">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{lead.property}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${statusColors[lead.status]}`}>
                        {statusTitles[lead.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="bg-[#1a1a1a] p-1.5 rounded-lg border border-neutral-800">
                          {originIcons[lead.origin]}
                        </div>
                        <span className="text-neutral-400 text-xs font-medium capitalize">{lead.origin}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="font-medium text-emerald-400">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(lead.value)}
                      </span>
                      <div className="text-[10px] text-neutral-500 mt-1">
                        Desde {format(new Date(lead.createdAt), "dd MMM yy", { locale: ptBR })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <button className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors">
                         <ChevronRight className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
