import { KanbanBoard } from "@/components/kanban/Board";

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-100 mb-1">Visão Geral de Leads</h2>
        <p className="text-sm text-neutral-400">
          Arraste e solte os cards para atualizar a etapa do funil do cliente.
        </p>
      </div>
      
      {/* Quadro Principal */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard />
      </div>
    </div>
  );
}
