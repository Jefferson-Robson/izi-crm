"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Usuário não está logado, expulsa pra tela de login
        router.push("/login");
      } else {
        // Verificar status da assinatura
        try {
          const docRef = doc(db, "agencies", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const status = data.stripeSubscriptionStatus;
            
            // Se estiver inadimplente, redireciona para a tela de plano
            if (status && ['past_due', 'unpaid'].includes(status)) {
               if (window.location.pathname !== '/configs') {
                 router.push('/configs?error=payment_required');
                 return;
               }
            }
          }
        } catch (error) {
          console.error("Erro ao verificar assinatura:", error);
        }

        // Logado, permite o render
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-12 h-12 border-4 border-neutral-800 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.5)]"></div>
        <p className="mt-4 text-amber-500 font-bold tracking-widest text-xs uppercase animate-pulse">Autenticando Licença...</p>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#0a0a0a]">
        <Topbar />
        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </>
  );
}
