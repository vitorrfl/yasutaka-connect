"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { GlassBar } from "@/components/ui/GlassBar";
import { ChevronIcon, CloseIcon, CollapseIcon, MenuIcon } from "@/components/ui/icons";
import { NAV_GROUPS, isGroupActive } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const COLLAPSED_KEY = "yasutaka:sidebar-collapsed";
const COLLAPSED_EVENT = "yasutaka:sidebar-collapsed-change";

function subscribeCollapsed(callback: () => void) {
  window.addEventListener(COLLAPSED_EVENT, callback);
  return () => window.removeEventListener(COLLAPSED_EVENT, callback);
}

function getCollapsedSnapshot() {
  return localStorage.getItem(COLLAPSED_KEY) === "1";
}

function getCollapsedServerSnapshot() {
  return false;
}

function setCollapsedPreference(value: boolean) {
  localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  window.dispatchEvent(new Event(COLLAPSED_EVENT));
}

/** `tone` existe porque a marca aparece sobre duas superficies: o navy da
 *  sidebar/drawer (texto branco) e o vidro da barra mobile (texto escuro). */
function Brand({ collapsed, tone = "dark" }: { collapsed?: boolean; tone?: "dark" | "light" }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Image src="/logo.jpg" alt="" width={32} height={32} className="shrink-0 rounded-full" />
      {!collapsed && (
        <span
          className={cn(
            "truncate text-base font-semibold tracking-tight",
            tone === "light" ? "text-slate-900" : "text-white"
          )}
        >
          Yasutaka Connect
        </span>
      )}
    </span>
  );
}

function GroupNav({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const [manualExpanded, setManualExpanded] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_GROUPS.map((group) => {
        const active = isGroupActive(group, pathname);
        const expanded = manualExpanded[group.label] ?? active;
        const GroupIcon = group.icon;

        if (collapsed) {
          return (
            <Link
              key={group.label}
              href={group.items[0].href}
              title={group.label}
              className={cn(
                "flex items-center justify-center rounded-md border-l-4 border-transparent px-3 py-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white",
                active && "border-blue-600 bg-slate-800 text-white"
              )}
            >
              <GroupIcon width={18} height={18} className="shrink-0" />
            </Link>
          );
        }

        return (
          <div key={group.label} className="flex flex-col">
            <button
              type="button"
              onClick={() => setManualExpanded((prev) => ({ ...prev, [group.label]: !expanded }))}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <GroupIcon width={18} height={18} className="shrink-0" />
              <span className="flex-1 text-left">{group.label}</span>
              <ChevronIcon
                width={14}
                height={14}
                className={cn("shrink-0 transition-transform", expanded && "rotate-90")}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <div className="mt-1 flex flex-col gap-1 border-l border-slate-800 pl-3">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-3 rounded-md border-l-4 border-transparent px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white",
                          isActive && "border-blue-600 bg-slate-800 text-white"
                        )}
                      >
                        <ItemIcon width={16} height={16} className="shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closingIcon, setClosingIcon] = useState(false);
  const collapsed = useSyncExternalStore(subscribeCollapsed, getCollapsedSnapshot, getCollapsedServerSnapshot);

  function toggleCollapsed() {
    setCollapsedPreference(!collapsed);
  }

  function closeDrawer() {
    setClosingIcon(true);
    setTimeout(() => {
      setMobileOpen(false);
      setClosingIcon(false);
    }, 150);
  }

  return (
    <>
      {/* Barra superior — só no mobile.
          Mesma gramática da TabBar: cápsula de vidro agrupando a identidade +
          botão circular solto pra ação. `sticky` mantém a barra no fluxo (o
          conteúdo já começa abaixo dela) e a faz pairar sobre o que rola. */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden print:hidden">
        <GlassBar className="min-w-0 gap-2 p-2 pr-4">
          <Brand tone="light" />
        </GlassBar>
        <Button
          variant="glass"
          shape="circle"
          size="lg"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
          className="shrink-0"
        >
          <MenuIcon width={20} height={20} />
        </Button>
      </header>

      {/* Drawer mobile */}
      <div
        aria-hidden={!mobileOpen}
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-200 md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
        <div
          className={cn(
            "relative flex h-full w-64 flex-col overflow-y-auto bg-slate-900 transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <Brand />
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={closeDrawer}
              className="group rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <CloseIcon
                width={20}
                height={20}
                className={cn(
                  "transition-transform duration-150 group-hover:rotate-45",
                  closingIcon ? "rotate-45" : "rotate-0"
                )}
              />
            </button>
          </div>
          <GroupNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Painel fixo — desktop, retrátil */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col bg-slate-900 transition-[width] duration-200 md:flex print:hidden",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <div className={cn("flex items-center px-5 py-6", collapsed && "justify-center px-0")}>
          <Brand collapsed={collapsed} />
        </div>
        <GroupNav pathname={pathname} collapsed={collapsed} />

        <div className="mt-auto border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Expandir painel" : "Retrair painel"}
            title={collapsed ? "Expandir painel" : "Retrair painel"}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <CollapseIcon width={18} height={18} className={cn("shrink-0 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && "Retrair"}
          </button>
        </div>
      </aside>
    </>
  );
}
