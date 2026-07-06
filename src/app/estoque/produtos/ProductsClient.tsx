"use client";

import { useState, useTransition, type SVGProps } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ProductJSON } from "@/domain/entities/Product";
import { UNIT_OPTIONS } from "@/lib/units";
import {
  createProductAction,
  addVariantAction,
  adjustVariantQuantityAction,
  removeVariantAction,
  deleteProductAction,
} from "./actions";

interface ProductsClientProps {
  products: ProductJSON[];
}

function quantityVariant(quantity: number): "danger" | "warning" | "success" {
  if (quantity === 0) return "danger";
  if (quantity < 5) return "warning";
  return "success";
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ProductCard({
  product,
  onManage,
  onDelete,
}: {
  product: ProductJSON;
  onManage: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemCount = product.variants.length;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white transition-shadow",
        open ? "border-slate-300 shadow-sm" : "border-slate-200 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-slate-900">{product.name}</div>
          <div className="text-xs text-slate-500">
            {product.unit} · {itemCount} {itemCount === 1 ? "item" : "itens"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-base font-semibold leading-none text-slate-900">{product.totalQuantity}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">total</div>
        </div>
        <ChevronIcon
          width={18}
          height={18}
          className={cn("shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-90")}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-t border-slate-200 p-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Itens</span>
              {itemCount > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((v) => (
                    <Badge key={v.id} variant={quantityVariant(v.quantity)}>
                      {v.name}: {v.quantity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-400">Nenhum item cadastrado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={onManage}>
                Gerenciar
              </Button>
              <Button size="sm" variant="danger" className="flex-1" onClick={onDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductsClient({ products }: ProductsClientProps) {
  const [isNewProductOpen, setNewProductOpen] = useState(false);
  const [variantRowCount, setVariantRowCount] = useState(1);
  const [managingProductId, setManagingProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const managingProduct = products.find((p) => p.id === managingProductId) ?? null;

  function closeNewProductModal() {
    setNewProductOpen(false);
    setVariantRowCount(1);
  }

  function deleteProduct(productId: string) {
    const fd = new FormData();
    fd.set("productId", productId);
    startTransition(() => deleteProductAction(fd));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setNewProductOpen(true)}>+ Nova Categoria</Button>
      </div>

      {products.length === 0 ? (
        <p className="rounded-md border border-slate-200 py-8 text-center text-sm text-slate-500">
          Nenhuma categoria cadastrada ainda
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onManage={() => setManagingProductId(p.id)}
              onDelete={() => deleteProduct(p.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isNewProductOpen} onClose={closeNewProductModal} title="Nova Categoria">
        <form
          action={(fd) => {
            startTransition(async () => {
              await createProductAction(fd);
              closeNewProductModal();
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Nome da categoria" htmlFor="name">
            <Input id="name" name="name" placeholder="Ex: Copo Stanley, Carimbo…" required />
          </FormField>
          <FormField label="Unidade de medida" htmlFor="unit">
            <Select id="unit" name="unit" defaultValue="un" options={UNIT_OPTIONS} />
          </FormField>

          <div className="flex flex-col gap-2">
            <div>
              <span className="text-sm font-medium text-slate-700">Itens</span>
              <p className="text-xs text-slate-500">Opcional — cada variação com sua quantidade atual.</p>
            </div>
            {variantRowCount > 0 && (
              <div className="flex gap-2 px-0.5 text-xs font-medium text-slate-400">
                <span className="flex-1">Item</span>
                <span className="w-20 shrink-0">Qtd.</span>
              </div>
            )}
            {Array.from({ length: variantRowCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input name="variantName" placeholder="Ex: Printer 10" className="flex-1" />
                <Input
                  name="variantQuantity"
                  type="number"
                  min={0}
                  defaultValue={0}
                  aria-label="Quantidade"
                  className="w-20 shrink-0"
                />
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariantRowCount((n) => n + 1)}>
              + Adicionar item
            </Button>
          </div>

          <Button type="submit" isLoading={isPending}>
            Salvar categoria
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={!!managingProduct}
        onClose={() => setManagingProductId(null)}
        title={managingProduct ? `Itens de ${managingProduct.name}` : undefined}
      >
        {managingProduct && (
          <div className="flex flex-col gap-4">
            {managingProduct.variants.map((v) => (
              <form
                key={v.id}
                action={(fd) => {
                  fd.set("productId", managingProduct.id);
                  fd.set("variantId", v.id);
                  startTransition(() => adjustVariantQuantityAction(fd));
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{v.name}</span>
                <Input name="quantity" type="number" min={0} defaultValue={v.quantity} className="w-20 sm:w-24" />
                <Button size="sm" type="submit" isLoading={isPending}>
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  onClick={() => {
                    const fd = new FormData();
                    fd.set("productId", managingProduct.id);
                    fd.set("variantId", v.id);
                    startTransition(() => removeVariantAction(fd));
                  }}
                >
                  Remover
                </Button>
              </form>
            ))}

            <form
              action={(fd) => {
                fd.set("productId", managingProduct.id);
                startTransition(() => addVariantAction(fd));
              }}
              className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-end"
            >
              <FormField label="Novo item" htmlFor="newVariantName">
                <Input id="newVariantName" name="name" placeholder="Ex: Printer 20" required />
              </FormField>
              <FormField label="Quantidade" htmlFor="newVariantQty">
                <Input id="newVariantQty" name="quantity" type="number" min={0} defaultValue={0} className="sm:w-24" />
              </FormField>
              <Button type="submit" isLoading={isPending}>
                Adicionar
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
