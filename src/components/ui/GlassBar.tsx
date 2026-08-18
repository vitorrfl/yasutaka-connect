import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Cápsula de vidro que agrupa controles flutuantes.
 *
 * É o equivalente do `GlassEffectContainer` do iOS 26: controles relacionados
 * dividem UMA superfície de vidro em vez de cada um carregar a sua. Isso
 * importa visualmente — vidros empilhados escurecem onde se sobrepõem e o
 * grupo perde a leitura de peça única.
 */
export function GlassBar({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass inline-flex items-center gap-1 rounded-full p-1.5", className)}>{children}</div>;
}
