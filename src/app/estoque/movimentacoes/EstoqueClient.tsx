"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { ProductJSON } from "@/domain/entities/Product";
import { StockMovementType } from "@/domain/entities/StockMovement";
import { registerMovementAction } from "./actions";

type MovementView = {
  id: string;
  productId: string;
  variantId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  createdAt: string;
  productName: string;
  variantName: string;
};

interface EstoqueClientProps {
  products: ProductJSON[];
  movements: MovementView[];
}

const TYPE_LABEL: Record<StockMovementType, string> = {
  [StockMovementType.ENTRADA]: "Entrada",
  [StockMovementType.SAIDA]: "Saída",
  [StockMovementType.AJUSTE]: "Ajuste",
};

const TYPE_BADGE: Record<StockMovementType, "success" | "danger" | "warning"> = {
  [StockMovementType.ENTRADA]: "success",
  [StockMovementType.SAIDA]: "danger",
  [StockMovementType.AJUSTE]: "warning",
};

export function EstoqueClient({ products, movements }: EstoqueClientProps) {
  const [isOpen, setOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId]
  );

  function closeModal() {
    setOpen(false);
  }

  const columns: TableColumn<MovementView>[] = [
    {
      header: "Data",
      cell: (m) => new Date(m.createdAt).toLocaleString("pt-BR"),
    },
    { header: "Categoria", cell: (m) => <span className="font-medium">{m.productName}</span> },
    { header: "Item", cell: (m) => m.variantName },
    {
      header: "Tipo",
      cell: (m) => <Badge variant={TYPE_BADGE[m.type]}>{TYPE_LABEL[m.type]}</Badge>,
    },
    { header: "Quantidade", cell: (m) => m.quantity },
    { header: "Motivo", cell: (m) => m.reason ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)} disabled={products.length === 0}>
          + Nova movimentação
        </Button>
      </div>

      {products.length === 0 && (
        <p className="text-sm text-slate-500">Cadastre uma categoria antes de registrar movimentações.</p>
      )}

      <Table
        data={movements}
        columns={columns}
        getRowKey={(m) => m.id}
        emptyMessage="Nenhuma movimentação registrada ainda"
      />

      <Modal isOpen={isOpen} onClose={closeModal} title="Nova movimentação">
        <form
          action={(fd) => {
            startTransition(async () => {
              await registerMovementAction(fd);
              closeModal();
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Categoria" htmlFor="productId">
            <Select
              id="productId"
              name="productId"
              value={selectedProductId}
              onChange={setSelectedProductId}
              options={products.map((p) => ({ value: p.id, label: p.name }))}
            />
          </FormField>

          <FormField label="Item" htmlFor="variantId">
            <Select
              key={selectedProductId}
              id="variantId"
              name="variantId"
              options={
                selectedProduct?.variants.map((v) => ({ value: v.id, label: `${v.name} (atual: ${v.quantity})` })) ??
                []
              }
            />
          </FormField>

          <FormField label="Tipo" htmlFor="type">
            <Select
              id="type"
              name="type"
              defaultValue={StockMovementType.ENTRADA}
              options={[
                { value: StockMovementType.ENTRADA, label: "Entrada" },
                { value: StockMovementType.SAIDA, label: "Saída" },
                { value: StockMovementType.AJUSTE, label: "Ajuste (define o valor exato)" },
              ]}
            />
          </FormField>

          <FormField label="Quantidade" htmlFor="quantity">
            <Input id="quantity" name="quantity" type="number" min={0} required defaultValue={1} />
          </FormField>

          <FormField label="Motivo (opcional)" htmlFor="reason">
            <Input id="reason" name="reason" placeholder="Ex: venda balcão, perda, recontagem..." />
          </FormField>

          <Button type="submit" isLoading={isPending}>
            Registrar
          </Button>
        </form>
      </Modal>
    </div>
  );
}
