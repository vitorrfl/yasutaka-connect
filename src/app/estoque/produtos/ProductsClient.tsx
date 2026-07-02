"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
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

  const columns: TableColumn<ProductJSON>[] = [
    { header: "Categoria", cell: (p) => <span className="font-medium">{p.name}</span> },
    { header: "Unidade", cell: (p) => p.unit },
    {
      header: "Itens",
      cell: (p) => (
        <div className="flex flex-wrap gap-1">
          {p.variants.map((v) => (
            <Badge key={v.id} variant={quantityVariant(v.quantity)}>
              {v.name}: {v.quantity}
            </Badge>
          ))}
        </div>
      ),
    },
    { header: "Total", cell: (p) => <span className="font-semibold">{p.totalQuantity}</span> },
    {
      header: "Ações",
      cell: (p) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setManagingProductId(p.id)}>
            Gerenciar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              const fd = new FormData();
              fd.set("productId", p.id);
              startTransition(() => deleteProductAction(fd));
            }}
          >
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setNewProductOpen(true)}>+ Nova Categoria</Button>
      </div>

      <Table data={products} columns={columns} getRowKey={(p) => p.id} emptyMessage="Nenhuma categoria cadastrada ainda" />

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
          <FormField label="Categoria" htmlFor="name">
            <Input id="name" name="name" placeholder="Ex: Copo Stanley, Carimbo..." required />
          </FormField>
          <FormField label="Unidade" htmlFor="unit">
            <Select id="unit" name="unit" defaultValue="un" options={UNIT_OPTIONS} />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Itens dessa categoria (ex: Printer 10, Copo Azul...) — deixe em branco se não houver
            </span>
            {Array.from({ length: variantRowCount }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row">
                <Input name="variantName" placeholder="Ex: Printer 10" />
                <Input name="variantQuantity" type="number" min={0} defaultValue={0} className="sm:w-28" />
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
