"use client";

import { Bell, Search, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <header className="h-16 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-neutral-800/50 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-amber-400 transition-colors" />
          <input
            type="text"
            placeholder="Buscar leads, contatos ou imóveis (Ctrl+K)"
            className="w-full bg-[#141414] border border-neutral-800 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-neutral-200 placeholder:text-neutral-600"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0a0a]"></span>
        </button>
        <div className="h-5 w-px bg-neutral-800"></div>
        <button 
          onClick={handleLogout}
          title="Sair do sistema"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            IZ
          </div>
          <span className="text-sm font-medium text-neutral-300 hidden sm:block">Sair</span>
          <LogOut className="w-4 h-4 text-neutral-500 ml-1" />
        </button>
      </div>
    </header>
  );
}
