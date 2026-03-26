"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MapPin, BedDouble, Bath, Square, Home as HomeIcon, Building, X, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import Image from "next/image";
import { tenantConfig } from "@/lib/config";

type PropertyType = "apartment" | "house" | "studio" | "commercial";

interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address: string;
  imageUrl: string;
  createdAt: string;
}

const typeIcons: Record<PropertyType, React.ReactNode> = {
  apartment: <Building className="w-4 h-4 text-amber-500" />,
  house: <HomeIcon className="w-4 h-4 text-emerald-500" />,
  studio: <Sparkles className="w-4 h-4 text-purple-500" />,
  commercial: <MapPin className="w-4 h-4 text-blue-500" />,
};

const typeNames: Record<PropertyType, string> = {
  apartment: "Apartamento",
  house: "Casa",
  studio: "Studio",
  commercial: "Comercial",
};

export default function CaptacoesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [fTitle, setFTitle] = useState("");
  const [fType, setFType] = useState<PropertyType>("apartment");
  const [fPrice, setFPrice] = useState("");
  const [fBedrooms, setFBedrooms] = useState("2");
  const [fBathrooms, setFBathrooms] = useState("1");
  const [fArea, setFArea] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fImageUrl, setFImageUrl] = useState("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    
    const q = query(
      collection(db, "properties"),
      where("agencyId", "==", auth.currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[];
      
      fetched.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setProperties(fetched);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "properties"), {
        title: fTitle,
        type: fType,
        price: Number(fPrice),
        bedrooms: Number(fBedrooms),
        bathrooms: Number(fBathrooms),
        area: Number(fArea),
        address: fAddress,
        imageUrl: fImageUrl,
        agencyId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      setIsModalOpen(false);
      
      // Reset form
      setFTitle("");
      setFPrice("");
      setFArea("");
      setFAddress("");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar. Verifique regras do Firestore.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = properties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-3 tracking-wide">
            Captações e Imóveis
            <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-md font-medium border border-emerald-500/20">
              {properties.length} Ativos
            </span>
          </h1>
          <p className="text-neutral-400 text-sm mt-1">Gerencie a carteira de imóveis exclusivos disponíveis para seus clientes.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input 
              type="text" 
              placeholder="Buscar imóvel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#141414] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600 shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl transition-all font-medium shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nova Captação
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-neutral-800 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-neutral-500 text-xs font-medium uppercase tracking-widest">Carregando Galeria...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0f0f0f]/80 backdrop-blur-sm border border-neutral-800/80 rounded-2xl p-8">
          <div className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mb-4 border border-neutral-800">
            <HomeIcon className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-bold text-neutral-200 mb-1">Nenhum imóvel listado</h3>
          <p className="text-neutral-500 text-sm max-w-sm">
            Adicione sua primeira captação para começar a divulgá-la no {tenantConfig.appName}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-6">
          {filtered.map(property => (
            <div key={property.id} className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group flex flex-col">
              <div className="h-56 w-full relative overflow-hidden bg-neutral-900">
                {/* Imagem de Fundo Simulada (Em um app real, o next/image precisa de host configurado) */}
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  {typeIcons[property.type]}
                  <span className="text-xs font-semibold text-white tracking-widest uppercase">{typeNames[property.type]}</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white leading-tight drop-shadow-md">{property.title}</h3>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span className="truncate">{property.address}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-4 border-y border-neutral-800/50">
                  <div className="flex flex-col items-center justify-center bg-[#0a0a0a] rounded-xl py-2">
                    <BedDouble className="w-4 h-4 text-neutral-500 mb-1" />
                    <span className="text-neutral-200 font-bold">{property.bedrooms} <span className="text-xs font-normal text-neutral-500">Qts</span></span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-[#0a0a0a] rounded-xl py-2">
                    <Bath className="w-4 h-4 text-neutral-500 mb-1" />
                    <span className="text-neutral-200 font-bold">{property.bathrooms} <span className="text-xs font-normal text-neutral-500">Wcs</span></span>
                  </div>
                  <div className="flex flex-col items-center justify-center bg-[#0a0a0a] rounded-xl py-2">
                    <Square className="w-4 h-4 text-neutral-500 mb-1" />
                    <span className="text-neutral-200 font-bold">{property.area} <span className="text-xs font-normal text-neutral-500">m²</span></span>
                  </div>
                </div>

                <div className="pt-1 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest block mb-1">Valor Venda</span>
                    <span className="text-2xl font-black text-amber-500 tracking-tight">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(property.price)}
                    </span>
                  </div>
                  <button className="text-sm font-medium text-white bg-[#262626] hover:bg-neutral-700 px-4 py-2 rounded-lg transition-colors border border-neutral-700 hover:border-neutral-500">
                    Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nova Captação */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f0f0f] border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800/80 bg-[#141414]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <HomeIcon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-wide">Nova Captação</h2>
                  <p className="text-sm text-neutral-400">Insira as informações do imóvel no banco de dados.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="p-6 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Título do Anúncio</label>
                  <input required value={fTitle} onChange={e=>setFTitle(e.target.value)} type="text" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Ex: Apartamento de Luxo no Jardins" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tipo de Imóvel</label>
                  <select required value={fType} onChange={e=>setFType(e.target.value as PropertyType)} className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500 appearance-none">
                    <option value="apartment">Apartamento</option>
                    <option value="house">Casa em Condomínio / Rua</option>
                    <option value="studio">Studio / Loft</option>
                    <option value="commercial">Sala Comercial</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Valor (R$)</label>
                  <input required value={fPrice} onChange={e=>setFPrice(e.target.value)} type="number" min="0" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="0" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Quartos</label>
                  <input required value={fBedrooms} onChange={e=>setFBedrooms(e.target.value)} type="number" min="0" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Banheiros</label>
                  <input required value={fBathrooms} onChange={e=>setFBathrooms(e.target.value)} type="number" min="0" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Área Privativa (m²)</label>
                  <input required value={fArea} onChange={e=>setFArea(e.target.value)} type="number" min="0" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">URL da Foto de Capa (Unsplash, etc)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input required value={fImageUrl} onChange={e=>setFImageUrl(e.target.value)} type="url" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="https://..." />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Endereço Completo</label>
                  <input required value={fAddress} onChange={e=>setFAddress(e.target.value)} type="text" className="w-full bg-[#1a1a1a] border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Rua, Número, Bairro, Cidade - Estado" />
                </div>

              </div>
              
              <div className="flex gap-4 pt-4 border-t border-neutral-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3.5 px-4 bg-[#1a1a1a] hover:bg-[#262626] border border-neutral-800 rounded-xl text-neutral-300 font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publicar Captação"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
