"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmOptions {
  /** Título do diálogo — ex.: "Excluir categoria". */
  title: string;
  /** Corpo explicando a consequência. Deixe claro que é irreversível. */
  description?: ReactNode;
  /** Rótulo do botão que confirma a ação destrutiva. Padrão: "Excluir". */
  confirmLabel?: string;
  /** Rótulo do botão que aborta. Padrão: "Cancelar". */
  cancelLabel?: string;
}

/**
 * Dupla verificação para ações destrutivas (apagar / excluir / remover / cancelar).
 *
 * Padrão do projeto: NENHUM botão de apagar, excluir ou cancelar dispara direto —
 * todos passam por aqui. Uso imperativo baseado em Promise:
 *
 *   const { confirm, dialog } = useConfirm();
 *   // ...
 *   onClick={async () => {
 *     if (await confirm({ title: "Excluir X", description: "..." })) doDelete();
 *   }}
 *   // renderize {dialog} uma vez na árvore do componente.
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const resolverRef = useRef<((confirmed: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const settle = useCallback((confirmed: boolean) => {
    resolverRef.current?.(confirmed);
    resolverRef.current = null;
    setIsOpen(false);
  }, []);

  const dialog = (
    <Modal isOpen={isOpen} onClose={() => settle(false)} title={options?.title}>
      <div className="flex flex-col gap-5">
        {options?.description != null && (
          <div className="text-sm leading-relaxed text-slate-600">{options.description}</div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => settle(false)}>
            {options?.cancelLabel ?? "Cancelar"}
          </Button>
          <Button variant="danger" onClick={() => settle(true)}>
            {options?.confirmLabel ?? "Excluir"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { confirm, dialog };
}
