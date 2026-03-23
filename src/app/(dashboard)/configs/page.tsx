"use client";

import { useEffect, useState } from "react";
import { User, Mail, Link as LinkIcon, Camera, Loader2, LogOut, Save, Shield } from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ConfigsPage() {
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [creci, setCreci] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const user = auth.currentUser;

  useEffect(() => {
    async function loadAgencyProfile() {
      if (!user) return;
      
      setDisplayName(user.displayName || "");
      setPhotoURL(user.photoURL || "");

      try {
        const docRef = doc(db, "agencies", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setCreci(docSnap.data().creci || "");
        }
      } catch (error) {
        console.error("Erro ao carregar perfil extra:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAgencyProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      // 1. Atualizar perfil básico no Firebase Auth
      await updateProfile(user, {
        displayName: displayName || null,
        photoURL: photoURL || null
      });

      // 2. Salvar metadados extras no Firestore (Agencies)
      await setDoc(doc(db, "agencies", user.uid), {
        creci,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
     return (
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-neutral-800 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="mt-3 text-neutral-500 text-xs font-medium uppercase tracking-widest">Carregando Identidade...</p>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-wide">
          Configurações da Conta
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Gerencie a identidade visual e os acessos da sua imobiliária no sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        
        {/* Left Column: Avatar & Quick Actions */}
        <div className="col-span-1 space-y-6">
          <div className="bg-[#141414] border border-neutral-800/80 rounded-2xl p-6 flex flex-col items-center text-center">
            <div className="relative mb-4 group">
              <div className="w-28 h-28 rounded-full bg-neutral-900 border-2 border-neutral-800 overflow-hidden shadow-xl flex items-center justify-center">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-neutral-700" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-2 border-amber-500/50">
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Alt. Foto</span>
              </div>
            </div>
            
            <h2 className="text-lg font-bold text-white leading-tight">{displayName || "Corretor(a)"}</h2>
            <p className="text-sm text-neutral-500 font-medium mb-6 truncate w-full" title={user?.email || ""}>
              {user?.email}
            </p>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 rounded-xl transition-colors font-semibold text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>

          <div className="bg-[#141414] border border-neutral-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Segurança
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-4">
              Sua conta é autenticada através do banco de dados militar do Google Firebase (Identity Platform).
            </p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg py-2 px-3 flex justify-between items-center cursor-not-allowed opacity-60">
              <span className="text-sm text-neutral-400 font-medium">Redefinir Senha</span>
              <span className="text-xs bg-neutral-800 px-2 rounded text-neutral-500">Bloqueado</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="col-span-1 md:col-span-2 bg-[#141414] border border-neutral-800/80 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-neutral-800/80 bg-[#0a0a0a]">
             <h3 className="font-bold text-white text-lg">Informações do Perfil Público</h3>
             <p className="text-xs text-neutral-500 mt-1">Estes dados aparecem nos cartões de leads e relatórios exportados.</p>
          </div>

          <form onSubmit={handleSave} className="p-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Nome de Exibição (Agência ou Operador)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                    placeholder="Ex: IZI Imóveis"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">CRECI (Opcional)</label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    value={creci}
                    onChange={(e) => setCreci(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600 uppercase"
                    placeholder="000.000-F"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Endereço do E-mail</label>
                <div className="relative opacity-60 cursor-not-allowed">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="text" 
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-[#1a1a1a] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-[10px] text-amber-500/80">O e-mail de acesso não pode ser alterado por motivos de segurança do tenant.</p>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">URL do Logotipo ou Foto (Avatar)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <input 
                    type="url" 
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                    placeholder="https://..."
                  />
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800/50 flex justify-end">
               <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.6)] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {saving ? "Salvando Identidade..." : "Atualizar Perfil"}
                </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
