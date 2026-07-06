"use client";

import { useEffect, useMemo, useRef, useState, type SVGProps } from "react";
import { cn } from "@/lib/utils";

export interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  id?: string;
  name: string;
  options: readonly SearchableSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
}

function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

/**
 * Select com campo de busca. Mesmo visual do `Select`, mas filtra as opções por
 * texto — pensado para listas que crescem (ex.: categorias). Envia o valor por
 * um input hidden, então funciona dentro de <form> como um select comum.
 */
export function SearchableSelect({
  id,
  name,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar…",
  className,
}: SearchableSelectProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setQuery("");
  }

  useEffect(() => {
    if (!open) return;
    // Foca a busca assim que abre (manipular o DOM é efeito legítimo).
    inputRef.current?.focus();
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function selectOption(v: string) {
    if (!isControlled) setInternalValue(v);
    onChange?.(v);
    close();
  }

  const selectedLabel = options.find((o) => o.value === selected)?.label;

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected} />
      <button
        type="button"
        id={id}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
          className
        )}
      >
        <span className={cn("truncate", !selectedLabel && "text-slate-400")}>
          {selectedLabel ?? placeholder ?? ""}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("shrink-0 text-slate-400 transition-transform duration-150", open && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div
        className={cn(
          "absolute z-20 mt-1 grid w-full transition-[grid-template-rows,opacity] duration-150 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="rounded-md border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 px-3">
              <SearchIcon width={16} height={16} className="shrink-0 text-slate-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full bg-transparent text-sm placeholder:text-slate-400 focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filtered[0]) {
                    e.preventDefault();
                    selectOption(filtered[0].value);
                  }
                }}
              />
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-400">Nada encontrado</div>
              ) : (
                filtered.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => selectOption(o.value)}
                    className={cn(
                      "block w-full px-3 py-2 text-left text-sm hover:bg-slate-100",
                      o.value === selected && "bg-blue-50 font-medium text-blue-700"
                    )}
                  >
                    {o.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
