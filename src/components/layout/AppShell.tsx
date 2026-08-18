import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TabBar } from "./TabBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      {/* pb no mobile reserva o espaço da tab bar flutuante: sem isso o último
          item de qualquer lista fica escondido atrás do vidro. */}
      <div className="min-w-0 flex-1 overflow-x-hidden pb-24 md:pb-0 print:pb-0">{children}</div>
      <TabBar />
    </div>
  );
}
