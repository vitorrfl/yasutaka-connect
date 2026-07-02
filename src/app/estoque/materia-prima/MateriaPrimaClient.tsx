"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { Table, type TableColumn } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { RawMaterialJSON } from "@/domain/entities/RawMaterial";
import { createMaterialAction, adjustMaterialQuantityAction, deleteMaterialAction } from "./actions";
import { UNIT_OPTIONS } from "@/lib/units";

interface MateriaPrimaClientProps {
  materials: RawMaterialJSON[];
}

function quantityVariant(quantity: number): "danger" | "warning" | "success" {
  if (quantity === 0) return "danger";
  if (quantity < 5) return "warning";
  return "success";
}

export function MateriaPrimaClient({ materials }: MateriaPrimaClientProps) {
  const [isNewOpen, setNewOpen] = useState(false);
  const [managingMaterialId, setManagingMaterialId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const managingMaterial = materials.find((m) => m.id === managingMaterialId) ?? null;

  const columns: TableColumn<RawMaterialJSON>[] = [
    { header: "Matéria-prima", cell: (m) => <span className="font-medium">{m.name}</span> },
    { header: "Unidade", cell: (m) => m.unit },
    {
      header: "Quantidade",
      cell: (m) => <Badge variant={quantityVariant(m.quantity)}>{m.quantity}</Badge>,
    },
    {
      header: "Ações",
      cell: (m) => (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setManagingMaterialId(m.id)}>
            Ajustar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              const fd = new FormData();
              fd.set("materialId", m.id);
              startTransition(() => deleteMaterialAction(fd));
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
        <Button onClick={() => setNewOpen(true)}>+ Nova matéria-prima</Button>
      </div>

      <Table
        data={materials}
        columns={columns}
        getRowKey={(m) => m.id}
        emptyMessage="Nenhuma matéria-prima cadastrada ainda"
      />

      <Modal isOpen={isNewOpen} onClose={() => setNewOpen(false)} title="Nova matéria-prima">
        <form
          action={(fd) => {
            startTransition(async () => {
              await createMaterialAction(fd);
              setNewOpen(false);
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Nome" htmlFor="name">
            <Input id="name" name="name" placeholder="Ex: Papel fotográfico A4" required />
          </FormField>
          <FormField label="Unidade" htmlFor="unit">
            <Select id="unit" name="unit" defaultValue="un" options={UNIT_OPTIONS} />
          </FormField>
          <FormField label="Quantidade inicial" htmlFor="quantity">
            <Input id="quantity" name="quantity" type="number" min={0} defaultValue={0} />
          </FormField>
          <Button type="submit" isLoading={isPending}>
            Salvar
          </Button>
        </form>
      </Modal>

      <Modal
        isOpen={!!managingMaterial}
        onClose={() => setManagingMaterialId(null)}
        title={managingMaterial ? `Ajustar quantidade de ${managingMaterial.name}` : undefined}
      >
        {managingMaterial && (
          <form
            action={(fd) => {
              fd.set("materialId", managingMaterial.id);
              startTransition(async () => {
                await adjustMaterialQuantityAction(fd);
                setManagingMaterialId(null);
              });
            }}
            className="flex items-end gap-2"
          >
            <FormField label="Quantidade" htmlFor="quantity">
              <Input id="quantity" name="quantity" type="number" min={0} defaultValue={managingMaterial.quantity} required />
            </FormField>
            <Button type="submit" isLoading={isPending}>
              Salvar
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
