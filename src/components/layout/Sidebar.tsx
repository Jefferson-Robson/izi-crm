"use client";

import { Home, LayoutDashboard, Settings, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Kanban", icon: LayoutDashboard, href: "/" },
  { name: "Clientes", icon: Users, href: "/clientes" },
  { name: "Captações", icon: Home, href: "/captacoes" },
  { name: "Configurações", icon: Settings, href: "/configs" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0f0f0f] border-r border-neutral-800/50 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-neutral-800/50">
        <h1 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-500">
          IZI CRM
        </h1>
      </div>

      <div className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-4 px-2">
          Menu Principal
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium",
                isActive
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-neutral-800/50">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-new-lead'))}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_-3px_rgba(245,158,11,0.5)]"
        >
          <UserPlus className="w-4 h-4" />
          Novo Lead
        </button>
      </div>
    </aside>
  );
}
