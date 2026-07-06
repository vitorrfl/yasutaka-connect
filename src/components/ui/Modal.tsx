"use client";

import { ReactNode, useEffect, useRef, useState, type SVGProps } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

const EXIT_MS = 300;

// Scroll lock contado por referência: com modais empilhados (ex.: uma confirmação
// por cima do modal de gerenciar), o body só volta a rolar quando o último fecha.
let lockCount = 0;
function lockBodyScroll() {
  if (lockCount === 0) document.body.style.overflow = "hidden";
  lockCount += 1;
}
function unlockBodyScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) document.body.style.overflow = "";
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  // "mounted" keeps the portal in the DOM through the exit animation;
  // "visible" drives the open/closed styles so both directions transition.
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(false);
  const [closingIcon, setClosingIcon] = useState(false);

  // Keep the last content around while closing so the panel doesn't go blank
  // mid-exit (parent often clears its state the instant it calls onClose).
  const contentRef = useRef<{ title?: string; children: ReactNode }>({ title, children });
  if (isOpen) contentRef.current = { title, children };

  function requestClose() {
    // Let the X visibly rotate before the panel slides/fades away.
    setClosingIcon(true);
    window.setTimeout(onClose, 150);
  }

  // Mount/unmount driven by isOpen. Unmount is delayed so the exit can play.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      setClosingIcon(false);
      return;
    }
    setVisible(false);
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // Once the closed state is actually in the DOM, flip to open on a later frame.
  // Two rAFs guarantee the browser painted the closed state first, so the
  // transition has somewhere to animate *from* (a single rAF fires too early
  // under React 19 + Turbopack and the entrance just pops in).
  useEffect(() => {
    if (!mounted || !isOpen) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [mounted, isOpen]);

  useEffect(() => {
    if (!mounted) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") requestClose();
    }
    document.addEventListener("keydown", onKeyDown);
    lockBodyScroll();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockBodyScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  if (!mounted || typeof document === "undefined") return null;

  const { title: shownTitle, children: shownChildren } = contentRef.current;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className={cn("absolute inset-0 bg-black/50 transition-opacity duration-300 ease-out", visible ? "opacity-100" : "opacity-0")}
        onClick={requestClose}
      />
      <div
        className={cn(
          "relative flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl transition-all duration-300 ease-out sm:max-w-md sm:rounded-lg",
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-0 sm:translate-y-4 sm:scale-95",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {/* Grabber — reforça o gesto de "puxar de baixo" no mobile */}
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-4 flex items-start justify-between gap-4">
          {shownTitle ? (
            <h2 className="text-lg font-semibold text-slate-900">{shownTitle}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            aria-label="Fechar"
            onClick={requestClose}
            className="group -mr-1.5 -mt-1.5 shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon
              className={cn(
                "transition-transform duration-150 group-hover:rotate-45",
                closingIcon ? "rotate-45" : "rotate-0"
              )}
            />
          </button>
        </div>

        {shownChildren}
      </div>
    </div>,
    document.body
  );
}
