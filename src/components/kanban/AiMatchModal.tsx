"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Home, MessageSquare, MapPin, DollarSign } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  property: string;
  value: number;
}

interface AiMatchModalProps {
  lead: Lead | null;
  onClose: () => void;
}

// Imóveis mockados que combinam com as pedidas
const matchedProperties = [
  { id: 1, title: "Apto Moderno Vista Mar", location: "Copacabana", price: 950000, match: 98 },
  { id: 2, title: "Studio Connect Downtown", location: "Centro", price: 320000, match: 85 },
  { id: 3, title: "Casa Alto Padrão - Alpha", location: "Alphaville", price: 2500000, match: 72 },
];

export function AiMatchModal({ lead, onClose }: AiMatchModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  // Simula o delay da chamada da API da OpenAI
  useEffect(() => {
    if (lead) {
      setIsAnalyzing(true);
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [lead]);

  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#0a0a0a] border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-[0_0_50px_-12px_rgba(245,158,11,0.2)] overflow-hidden relative">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/20 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-violet-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex items-center justify-between p-5 border-b border-neutral-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
              IZI Smart Match
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 relative z-10 min-h-[400px]">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center h-full pt-16 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-neutral-800 border-t-amber-500 animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-amber-500 animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-neutral-200">Processando Perfil Algorítmico</h3>
                <p className="text-sm text-neutral-500 max-w-sm">
                  Lendo o interesse de <span className="text-amber-400">"{lead.property}"</span> para {lead.name} e cruzando semanticamente com todos os nossos 453 imóveis da carteira...
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-neutral-100 mb-1">Top 3 Imóveis Encontrados</h3>
                <p className="text-sm text-neutral-400">
                  Encontramos os imóveis da base que mais se aproximam das intenções comportamentais e do budget de {lead.name}.
                </p>
              </div>

              <div className="space-y-4">
                {matchedProperties.map((prop, idx) => (
                  <div key={prop.id} className="bg-[#141414] border border-neutral-800 hover:border-amber-500/50 p-4 rounded-xl flex items-center justify-between group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-neutral-900 rounded-lg flex items-center justify-center shrink-0">
                        <Home className="w-6 h-6 text-neutral-600 group-hover:text-amber-400 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-neutral-200">{prop.title}</h4>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                            {prop.match}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {prop.location}</span>
                          <span className="flex items-center gap-1 text-emerald-500"><DollarSign className="w-3 h-3" /> {new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(prop.price)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Enviar Zap
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
