"use client";

import { useMemo, useState, useTransition, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SearchField } from "@/components/ui/SearchField";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { formatBRL, parseBRLToCents, centsToInput } from "@/lib/money";
import { SaleType } from "@/domain/entities/Sale";
import type { ProductJSON } from "@/domain/entities/Product";
import { createSaleAction } from "./actions";

const LOW_STOCK = 5;

/** Um item vendável = produto × variação. */
interface SellableRow {
  key: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unit: string;
  price: number; // centavos
  stock: number;
}

interface CartLine {
  key: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unit: string;
  stock: number;
  unitPriceCents: number;
  quantity: number;
  discountCents: number;
}

/** Rascunho do item sendo cadastrado/editado no modal "Cadastro dos Itens de Venda". */
interface ItemDraft {
  key: string;
  productName: string;
  variantName: string;
  unit: string;
  stock: number;
  productId: string;
  variantId: string;
  priceInput: string;
  qtyInput: string;
  discPctInput: string;
  discValInput: string;
}

function parseQty(input: string): number {
  const n = Number(String(input).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Cor de estoque no estilo do FpqSystem: 🟢 em estoque · 🟡 baixo · 🔴 zerado. */
function stockBadge(stock: number): { label: string; cls: string } {
  if (stock <= 0) return { label: `zerado`, cls: "bg-red-100 text-red-700" };
  if (stock < LOW_STOCK) return { label: `${stock} (baixo)`, cls: "bg-amber-100 text-amber-700" };
  return { label: `${stock}`, cls: "bg-emerald-100 text-emerald-700" };
}

function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function TrashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M6 6l1 14a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-14" />
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

export function PdvClient({ products }: { products: ProductJSON[] }) {
  const router = useRouter();
  const [type, setType] = useState<SaleType>(SaleType.VENDA);
  const [customerName, setCustomerName] = useState("Cliente Diversos");
  const [sellerName, setSellerName] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [freightInput, setFreightInput] = useState("");
  const [headerOpen, setHeaderOpen] = useState(false);
  const [showFreight, setShowFreight] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm, dialog } = useConfirm();

  // Modais
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ItemDraft | null>(null);

  const isQuote = type === SaleType.ORCAMENTO;

  const sellables = useMemo<SellableRow[]>(
    () =>
      products.flatMap((p) =>
        p.variants.map((v) => ({
          key: `${p.id}:${v.id}`,
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: v.name,
          unit: p.unit,
          price: v.price,
          stock: v.quantity,
        }))
      ),
    [products]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? sellables.filter((s) => `${s.productName} ${s.variantName}`.toLowerCase().includes(q))
      : sellables;
    return base.slice(0, 60);
  }, [sellables, query]);

  const freightCents = parseBRLToCents(freightInput);
  const grossItems = cart.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const discountTotal = cart.reduce((s, l) => s + l.discountCents, 0);
  const total = grossItems - discountTotal + freightCents;
  const totalQty = cart.reduce((s, l) => s + l.quantity, 0);
  const stockIssue = !isQuote && cart.some((l) => l.quantity > l.stock);

  // ---- Fluxo Incluir Produto ----
  function openSearch() {
    setError(null);
    setQuery("");
    setSearchOpen(true);
  }

  function pickProduct(row: SellableRow) {
    setSearchOpen(false);
    const existing = cart.find((l) => l.key === row.key);
    setDraft(
      existing
        ? {
            key: existing.key,
            productId: existing.productId,
            variantId: existing.variantId,
            productName: existing.productName,
            variantName: existing.variantName,
            unit: existing.unit,
            stock: existing.stock,
            priceInput: centsToInput(existing.unitPriceCents),
            qtyInput: String(existing.quantity).replace(".", ","),
            discPctInput: "",
            discValInput: centsToInput(existing.discountCents),
          }
        : {
            key: row.key,
            productId: row.productId,
            variantId: row.variantId,
            productName: row.productName,
            variantName: row.variantName,
            unit: row.unit,
            stock: row.stock,
            priceInput: centsToInput(row.price),
            qtyInput: "1",
            discPctInput: "",
            discValInput: "",
          }
    );
  }

  function editLine(line: CartLine) {
    setDraft({
      key: line.key,
      productId: line.productId,
      variantId: line.variantId,
      productName: line.productName,
      variantName: line.variantName,
      unit: line.unit,
      stock: line.stock,
      priceInput: centsToInput(line.unitPriceCents),
      qtyInput: String(line.quantity).replace(".", ","),
      discPctInput: "",
      discValInput: centsToInput(line.discountCents),
    });
  }

  // Recalcula desconto R$ a partir do % (e vice-versa), mantendo os dois em sincronia.
  function draftGross(d: ItemDraft): number {
    return parseBRLToCents(d.priceInput) * parseQty(d.qtyInput);
  }
  function onDraftPercent(pctStr: string) {
    setDraft((d) => {
      if (!d) return d;
      const pct = Number(pctStr.replace(",", ".")) || 0;
      const valCents = Math.round((draftGross(d) * pct) / 100);
      return { ...d, discPctInput: pctStr, discValInput: valCents ? centsToInput(valCents) : "" };
    });
  }
  function onDraftValue(valStr: string) {
    setDraft((d) => {
      if (!d) return d;
      const gross = draftGross(d);
      const valCents = Math.min(parseBRLToCents(valStr), gross);
      const pct = gross > 0 ? (valCents / gross) * 100 : 0;
      return { ...d, discValInput: valStr, discPctInput: pct ? pct.toFixed(2).replace(".", ",") : "" };
    });
  }

  function saveDraft() {
    setDraft((d) => {
      if (!d) return null;
      const priceCents = parseBRLToCents(d.priceInput);
      const qty = parseQty(d.qtyInput);
      if (qty <= 0) return d; // ignora quantidade inválida
      const gross = priceCents * qty;
      const discountCents = Math.min(parseBRLToCents(d.discValInput), gross);
      const line: CartLine = {
        key: d.key,
        productId: d.productId,
        variantId: d.variantId,
        productName: d.productName,
        variantName: d.variantName,
        unit: d.unit,
        stock: d.stock,
        unitPriceCents: priceCents,
        quantity: qty,
        discountCents,
      };
      setCart((prev) => {
        const idx = prev.findIndex((l) => l.key === d.key);
        if (idx === -1) return [...prev, line];
        const next = [...prev];
        next[idx] = line;
        return next;
      });
      return null;
    });
  }

  function removeLine(key: string) {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }

  async function clearCart() {
    if (await confirm({ title: "Limpar pedido", description: "Remover todos os itens deste pedido? Essa ação não pode ser desfeita." })) {
      setCart([]);
      setFreightInput("");
      setError(null);
    }
  }

  function finalize() {
    setError(null);
    if (cart.length === 0) return;
    if (stockIssue) {
      setError("Há itens com quantidade acima do estoque disponível.");
      return;
    }
    const items = cart.map((l) => ({
      productId: l.productId,
      variantId: l.variantId,
      quantity: l.quantity,
      unitPrice: l.unitPriceCents,
      discount: l.discountCents,
    }));
    startTransition(async () => {
      try {
        const { id } = await createSaleAction({
          items,
          type,
          customerName: customerName.trim() || undefined,
          sellerName: sellerName.trim() || undefined,
          freight: freightCents,
        });
        router.push(`/pdv/nota/${id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Não foi possível finalizar o pedido.");
      }
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200/70 bg-white p-8 text-center shadow-card">
        <p className="text-sm text-slate-500">Nenhum produto cadastrado ainda.</p>
        <Link href="/estoque/produtos" className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline">
          Cadastrar produtos →
        </Link>
      </div>
    );
  }

  const draftGrossC = draft ? draftGross(draft) : 0;
  const draftDiscC = draft ? Math.min(parseBRLToCents(draft.discValInput), draftGrossC) : 0;
  const draftTotalC = draftGrossC - draftDiscC;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Área rolável — o rodapé com o TOTAL fica sempre fixo embaixo */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-2">
        {/* Cabeçalho do pedido — resumo compacto que expande para editar */}
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-card">
        <button
          type="button"
          onClick={() => setHeaderOpen((o) => !o)}
          aria-expanded={headerOpen}
          className="flex w-full items-center gap-2 px-4 py-3 text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-900">{isQuote ? "Orçamento" : "Pedido de Venda"}</div>
            <div className="truncate text-xs text-slate-500">
              {customerName.trim() || "Cliente Diversos"}
              {sellerName.trim() && ` · ${sellerName.trim()}`}
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium text-blue-600">{headerOpen ? "Fechar" : "Editar"}</span>
          <ChevronIcon width={16} height={16} className={"shrink-0 text-slate-400 transition-transform duration-200 " + (headerOpen ? "rotate-90" : "")} />
        </button>
        <div className={"grid transition-[grid-template-rows] duration-200 ease-out " + (headerOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 border-t border-slate-100 p-4">
              <div className="flex gap-2">
                {[
                  { v: SaleType.VENDA, label: "Pedido de Venda" },
                  { v: SaleType.ORCAMENTO, label: "Orçamento" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setType(opt.v)}
                    className={
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors " +
                      (type === opt.v ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-600 hover:bg-slate-50")
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="pdv-cliente" className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
                  <Input id="pdv-cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Cliente Diversos" />
                </div>
                <div>
                  <label htmlFor="pdv-vendedor" className="mb-1 block text-sm font-medium text-slate-700">
                    Vendedor <span className="font-normal text-slate-400">(opcional)</span>
                  </label>
                  <Input id="pdv-vendedor" value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Atendente/vendedor" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Itens do pedido */}
      <div className="rounded-xl border border-slate-200/70 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Itens {cart.length > 0 && <span className="font-normal text-slate-400">· {totalQty} un</span>}
          </h2>
          <div className="flex items-center gap-2">
            {cart.length > 0 && (
              <button type="button" onClick={clearCart} className="text-xs font-medium text-slate-400 transition-colors hover:text-red-600">
                Limpar
              </button>
            )}
            <Button size="sm" onClick={openSearch}>
              <PlusIcon width={16} height={16} className="mr-1" /> Incluir produto
            </Button>
          </div>
        </div>

        {cart.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-400">
            Clique em <span className="font-medium text-slate-600">Incluir produto</span> para começar o pedido.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {cart.map((l) => {
              const over = !isQuote && l.quantity > l.stock;
              return (
                <li key={l.key} className="flex items-center gap-3 px-4 py-3">
                  <button type="button" onClick={() => editLine(l)} className="min-w-0 flex-1 text-left">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {l.productName}
                      <span className="font-normal text-slate-500"> · {l.variantName}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {String(l.quantity).replace(".", ",")} × {formatBRL(l.unitPriceCents)}
                      {l.discountCents > 0 && <span className="text-emerald-600"> − {formatBRL(l.discountCents)}</span>}
                      {over && <span className="text-red-600"> · acima do estoque ({l.stock})</span>}
                    </div>
                  </button>
                  <div className="shrink-0 text-right text-sm font-semibold text-slate-900 tabular-nums">
                    {formatBRL(l.unitPriceCents * l.quantity - l.discountCents)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(l.key)}
                    aria-label="Remover item"
                    className="shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

        {error && <p className="rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
      </div>

      {/* Barra de finalizar — sempre fixa no rodapé da tela (um TOTAL só) */}
      <div className="-mx-4 shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:px-6">
        {(showFreight || discountTotal > 0) && (
          <div className="mb-2 flex items-center justify-end gap-4 text-xs text-slate-500">
            {discountTotal > 0 && <span>Desconto −{formatBRL(discountTotal)}</span>}
            {showFreight && (
              <label className="flex items-center gap-1">
                Frete
                <span className="relative">
                  <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                  <input
                    value={freightInput}
                    onChange={(e) => setFreightInput(e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    aria-label="Frete"
                    className="h-7 w-20 rounded-md border border-slate-300 bg-white pl-7 pr-2 text-right text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </span>
              </label>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">TOTAL</span>
              {!showFreight && (
                <button type="button" onClick={() => setShowFreight(true)} className="text-xs font-medium text-blue-600 hover:underline">
                  + frete
                </button>
              )}
            </div>
            <div className="text-xl font-bold text-slate-900 tabular-nums">{formatBRL(total)}</div>
          </div>
          <Button size="lg" onClick={finalize} disabled={cart.length === 0 || isPending} isLoading={isPending}>
            {isQuote ? "Emitir orçamento" : "Finalizar e imprimir"}
          </Button>
        </div>
      </div>

      {/* Modal: busca de produtos */}
      <Modal isOpen={searchOpen} onClose={() => setSearchOpen(false)} title="Pesquisar produto">
        <div className="flex flex-col gap-3">
          <SearchField value={query} onChange={setQuery} placeholder="Buscar produto…" defaultOpen />
          <ul className="max-h-[50vh] divide-y divide-slate-100 overflow-y-auto rounded-md border border-slate-200">
            {results.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Nenhum produto encontrado</li>
            ) : (
              results.map((row) => {
                const badge = stockBadge(row.stock);
                return (
                  <li key={row.key}>
                    <button type="button" onClick={() => pickProduct(row)} className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {row.productName}
                          <span className="font-normal text-slate-500"> · {row.variantName}</span>
                        </div>
                        <div className="text-xs text-slate-500">{row.price > 0 ? formatBRL(row.price) : "sem preço"}</div>
                      </div>
                      <span className={"shrink-0 rounded-full px-2 py-0.5 text-xs font-medium " + badge.cls}>{badge.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      </Modal>

      {/* Modal: cadastro do item de venda */}
      <Modal isOpen={!!draft} onClose={() => setDraft(null)} title="Item do pedido">
        {draft && (
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">{draft.productName}</div>
              <div className="text-xs text-slate-500">{draft.variantName} · {draft.unit} · estoque {draft.stock}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Valor unitário</span>
                <Input value={draft.priceInput} onChange={(e) => setDraft({ ...draft, priceInput: e.target.value })} inputMode="decimal" placeholder="0,00" className="text-right" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Quantia</span>
                <Input value={draft.qtyInput} onChange={(e) => setDraft({ ...draft, qtyInput: e.target.value })} inputMode="decimal" placeholder="1" className="text-right" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Desconto %</span>
                <Input value={draft.discPctInput} onChange={(e) => onDraftPercent(e.target.value)} inputMode="decimal" placeholder="0" className="text-right" />
              </label>
              <label className="text-sm">
                <span className="mb-1 block font-medium text-slate-700">Desconto R$</span>
                <Input value={draft.discValInput} onChange={(e) => onDraftValue(e.target.value)} inputMode="decimal" placeholder="0,00" className="text-right" />
              </label>
            </div>

            <div className="flex items-baseline justify-between rounded-md bg-slate-50 px-3 py-2">
              <span className="text-sm font-medium text-slate-600">Valor total</span>
              <span className="text-lg font-bold text-slate-900 tabular-nums">{formatBRL(draftTotalC)}</span>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDraft(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={saveDraft} disabled={parseQty(draft.qtyInput) <= 0}>Salvar item</Button>
            </div>
          </div>
        )}
      </Modal>

      {dialog}
    </div>
  );
}
