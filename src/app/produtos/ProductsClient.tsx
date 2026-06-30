"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { ProductJSON } from "@/domain/entities/Product";
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
    { header: "Produto", cell: (p) => <span className="font-medium">{p.name}</span> },
    { header: "Unidade", cell: (p) => p.unit },
    {
      header: "Variações",
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
        <Button onClick={() => setNewProductOpen(true)}>+ Novo Produto</Button>
      </div>

      <Table data={products} columns={columns} getRowKey={(p) => p.id} emptyMessage="Nenhum produto cadastrado ainda" />

      <Modal isOpen={isNewProductOpen} onClose={closeNewProductModal} title="Novo Produto">
        <form
          action={(fd) => {
            startTransition(async () => {
              await createProductAction(fd);
              closeNewProductModal();
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Nome do produto" htmlFor="name">
            <Input id="name" name="name" placeholder="Ex: Copo Stanley" required />
          </FormField>
          <FormField label="Unidade" htmlFor="unit">
            <Input id="unit" name="unit" placeholder="un, cx, par..." defaultValue="un" />
          </FormField>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">
              Variações (cores, modelos...) — deixe em branco se não houver
            </span>
            {Array.from({ length: variantRowCount }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Input name="variantName" placeholder="Ex: Azul" />
                <Input name="variantQuantity" type="number" min={0} defaultValue={0} className="w-28" />
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariantRowCount((n) => n + 1)}>
              + Adicionar variação
            </Button>
          </div>

          <Button type="submit" isLoading={isPending}>
            Salvar produto
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={!!managingProduct}
        onClose={() => setManagingProductId(null)}
        title={managingProduct ? `Variações de ${managingProduct.name}` : undefined}
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
                className="flex items-center gap-2"
              >
                <span className="flex-1 text-sm">{v.name}</span>
                <Input name="quantity" type="number" min={0} defaultValue={v.quantity} className="w-24" />
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
              className="flex items-end gap-2 border-t border-slate-200 pt-4"
            >
              <FormField label="Nova variação" htmlFor="newVariantName">
                <Input id="newVariantName" name="name" placeholder="Ex: Verde" required />
              </FormField>
              <FormField label="Quantidade" htmlFor="newVariantQty">
                <Input id="newVariantQty" name="quantity" type="number" min={0} defaultValue={0} className="w-24" />
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
