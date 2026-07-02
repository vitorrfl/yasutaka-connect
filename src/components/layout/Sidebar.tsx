"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type SVGProps } from "react";
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

function EstoqueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function CentralIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  );
}

function MateriaPrimaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}

function ProdutosIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.59 13.41L13 21l-9-9V4h8l8.59 8.41a2 2 0 0 1 0 2.83z" />
      <circle cx="7.5" cy="7.5" r="1.25" />
    </svg>
  );
}

function MovimentacoesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 17V7M7 7l-3 3M7 7l3 3" />
      <path d="M17 7v10M17 17l-3-3M17 17l3-3" />
    </svg>
  );
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function CollapseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="M13.5 10l2 2-2 2" />
    </svg>
  );
}

interface NavGroup {
  label: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  items: { href: string; label: string; icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Estoque",
    icon: EstoqueIcon,
    items: [
      { href: "/estoque", label: "Central de Estoque", icon: CentralIcon },
      { href: "/estoque/produtos", label: "Produtos", icon: ProdutosIcon },
      { href: "/estoque/materia-prima", label: "Matéria Prima", icon: MateriaPrimaIcon },
      { href: "/estoque/movimentacoes", label: "Movimentações", icon: MovimentacoesIcon },
    ],
  },
];

function isGroupActive(group: NavGroup, pathname: string) {
  return group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}

function Brand({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Image src="/logo.jpg" alt="" width={32} height={32} className="shrink-0 rounded-full" />
      {!collapsed && <span className="text-base font-semibold tracking-tight text-white">Yasutaka Connect</span>}
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
      {/* Barra superior — só no mobile */}
      <header className="flex h-14 items-center justify-between bg-slate-900 px-4 md:hidden">
        <Brand />
        <button
          type="button"
          aria-label="Abrir menu"
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
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
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(
                  "transition-transform duration-150 group-hover:rotate-45",
                  closingIcon ? "rotate-45" : "rotate-0"
                )}
              >
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <GroupNav pathname={pathname} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Painel fixo — desktop, retrátil */}
      <aside
        className={cn(
          "hidden shrink-0 flex-col bg-slate-900 transition-[width] duration-200 md:flex",
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
