"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Building, Lock, Mail, Loader2, Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        // Disparar e-mail de Boas-vindas
        try {
          await fetch("/api/emails/welcome", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
          });
        } catch (mailError) {
          console.error("Erro ao enviar e-mail de boas-vindas:", mailError);
        }
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message.includes("auth/") ? "Credenciais inválidas ou e-mail já em uso." : "Ocorreu um erro no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden">
      
      {/* Left Area - Branding & Welcome */}
      <div className="hidden lg:flex w-[45%] bg-[#0a0a0a] border-r border-neutral-800/80 flex-col relative justify-center items-center p-12">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 blur-[120px] rounded-full" />
        
        <div className="max-w-md relative z-10 text-center">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_-5px_rgba(245,158,11,0.5)] rotate-3">
              <Building className="w-10 h-10 text-[#0a0a0a] -rotate-3" />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-white mb-4">
            IZI <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">CRM</span>
          </h1>
          <p className="text-neutral-400 text-lg leading-relaxed">
            O ecossistema imobiliário definitivo para gestão inteligente, acompanhamento de leads e conversão garantidas por IA.
          </p>
        </div>
      </div>

      {/* Right Area - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-md z-10">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? "Acessar Plataforma" : "Criar sua Licença"}</h2>
            <p className="text-neutral-400 text-sm">
              {isLogin ? "Bem-vindo de volta! Insira suas credenciais." : "Comece a modernizar sua imobiliária hoje."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-neutral-300">E-mail Comercial</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                  placeholder="voce@imobiliaria.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-neutral-300">Senha de Acesso</label>
                {isLogin && <a href="#" className="text-xs text-amber-500 hover:text-amber-400 font-medium">Esqueceu?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#141414] border border-neutral-800 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all text-neutral-100 placeholder:text-neutral-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-4 py-3.5 rounded-xl transition-all shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Entrar Seguramente" : "Criar Conta IZI"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              type="button" 
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-sm text-neutral-500 hover:text-amber-400 font-medium transition-colors"
            >
              {isLogin ? "Não tem uma conta? Crie uma agora." : "Já possui licença? Fazer Login."}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
