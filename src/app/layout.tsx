import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { tenantConfig } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: `${tenantConfig.appName} | O Padrão Ouro em SaaS Imobiliário`,
  description: "Faça login para gerenciar sua imobiliária",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark antialiased`}>
      <body className="bg-[#0a0a0a] text-neutral-100 min-h-screen flex w-full selection:bg-amber-500/30">
        {children}
      </body>
    </html>
  );
}
