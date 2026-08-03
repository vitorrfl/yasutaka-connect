"use client";

import { useEffect, useRef, useState, type SVGProps } from "react";
import { cn } from "@/lib/utils";

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Começa já expandido (útil para busca principal de uma tela). */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Campo de busca standalone com o padrão "lupa expansível" (ver AGENTS.md):
 * a lupa é um quadrado à direita que expande a própria largura (w-10 → w-full)
 * virando a barra de busca, enquanto o rótulo/consulta ao lado encolhe (w → 0).
 * Mesma mecânica do `SearchableSelect` — mantém toda lupa do app em sincronia.
 */
export function SearchField({ value, onChange, placeholder = "Buscar…", defaultOpen, className }: SearchFieldProps) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <div className={cn("flex h-10 w-full items-center", className)}>
      {/* Rótulo/consulta: encolhe até sumir (w → 0) quando a busca abre. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-10 shrink-0 items-center overflow-hidden rounded-md border bg-white text-left text-sm transition-[width,opacity,border-color] duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-blue-500",
          open ? "w-0 border-transparent px-0 opacity-0 pointer-events-none" : "w-[calc(100%-2.75rem)] border-slate-300 px-3 opacity-100"
        )}
      >
        <span className={cn("truncate", !value && "text-slate-400")}>{value || placeholder}</span>
      </button>

      {/* Quadrado da lupa: expande p/ esquerda (w-10 → w-full) e vira a barra de busca. */}
      <div
        className={cn(
          "relative flex h-10 shrink-0 items-center overflow-hidden rounded-md border bg-white transition-[width,margin,border-color,box-shadow] duration-300 ease-out",
          open ? "ml-0 w-full border-blue-500 ring-2 ring-blue-500" : "ml-1 w-10 border-slate-300"
        )}
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          tabIndex={open ? 0 : -1}
          className="h-full w-full bg-transparent pl-3 pr-10 text-sm placeholder:text-slate-400 focus:outline-none"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.currentTarget.blur();
              setOpen(false);
            }
          }}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar busca" : "Buscar"}
          aria-expanded={open}
          className={cn(
            "absolute right-0 top-0 flex h-10 w-10 items-center justify-center transition-colors",
            open ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <SearchIcon width={18} height={18} />
        </button>
      </div>
    </div>
  );
}
