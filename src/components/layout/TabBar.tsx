"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { GlassBar } from "@/components/ui/GlassBar";
import { TAB_ACCESSORY, TAB_ITEMS, activeHref } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Tab bar flutuante — mobile.
 *
 * Padrão iOS 26: a barra não encosta na borda inferior, ela PAIRA sobre o
 * conteúdo; e a ação principal fica num botão solto à direita, destacado do
 * grupo. Os destinos vêm de `@/lib/navigation`, mesma fonte da `Sidebar`.
 *
 * Cada aba usa `flex-1 min-w-0` + `truncate`: assim rótulo comprido encolhe
 * em vez de estourar a cápsula em tela estreita.
 */
export function TabBar() {
  const pathname = usePathname();
  const active = activeHref(
    pathname,
    TAB_ITEMS.map((item) => item.href)
  );
  const AccessoryIcon = TAB_ACCESSORY.icon;

  return (
    <div
      className={cn(
        // pointer-events-none no trilho pra não bloquear o conteúdo em volta;
        // reativado só na barra em si.
        "pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 md:hidden print:hidden",
        // Respeita o indicador de home do iPhone, com piso de 12px.
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      )}
    >
      <div className="pointer-events-auto flex w-full max-w-md items-center gap-2">
        <GlassBar className="flex flex-1">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex h-11 min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-0.5 rounded-full px-1 transition-[background-color,color] duration-200",
                  isActive
                    // Navy sólido, mesma identidade do FAB e do fundo da sidebar.
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Icon width={20} height={20} className="shrink-0" />
                <span className="w-full truncate text-center text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </GlassBar>

        {/* Acessório solto: separado do grupo de propósito — é o que sinaliza
            "esta é a ação principal", não só mais um destino. */}
        <Link
          href={TAB_ACCESSORY.href}
          aria-label={TAB_ACCESSORY.label}
          className={buttonClasses({ variant: "glassPrimary", size: "lg", shape: "circle", className: "shrink-0" })}
        >
          <AccessoryIcon width={20} height={20} />
        </Link>
      </div>
    </div>
  );
}
