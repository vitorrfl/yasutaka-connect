import Link from "next/link";
import { productService, rawMaterialService, stockMovementService } from "@/lib/container";
import { Badge } from "@/components/ui/Badge";
import { Table, type TableColumn } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

const LOW_STOCK_THRESHOLD = 5;
const TYPE_LABEL: Record<string, string> = { ENTRADA: "Entrada", SAIDA: "Saída", AJUSTE: "Ajuste" };
const TYPE_BADGE: Record<string, "success" | "danger" | "warning"> = {
  ENTRADA: "success",
  SAIDA: "danger",
  AJUSTE: "warning",
};

function SummaryCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

type LowStockRow = { key: string; name: string; detail: string; quantity: number; href: string };

export default async function CentralEstoquePage() {
  const [products, materials, movements] = await Promise.all([
    productService.listProducts(),
    rawMaterialService.listMaterials(),
    stockMovementService.listMovements(),
  ]);

  const productsJSON = products.map((p) => p.toJSON());
  const materialsJSON = materials.map((m) => m.toJSON());

  const lowStockRows: LowStockRow[] = [
    ...productsJSON.flatMap((p) =>
      p.variants
        .filter((v) => v.quantity < LOW_STOCK_THRESHOLD)
        .map((v) => ({
          key: `${p.id}-${v.id}`,
          name: p.name,
          detail: v.name,
          quantity: v.quantity,
          href: "/estoque/produtos",
        }))
    ),
    ...materialsJSON
      .filter((m) => m.quantity < LOW_STOCK_THRESHOLD)
      .map((m) => ({
        key: m.id,
        name: m.name,
        detail: "Matéria-prima",
        quantity: m.quantity,
        href: "/estoque/materia-prima",
      })),
  ].sort((a, b) => a.quantity - b.quantity);

  const now = new Date();
  const movementsThisMonth = movements.filter(
    (m) => m.createdAt.getMonth() === now.getMonth() && m.createdAt.getFullYear() === now.getFullYear()
  );

  const recentMovements = movements.slice(0, 5).map((m) => {
    const product = productsJSON.find((p) => p.id === m.productId);
    const variant = product?.variants.find((v) => v.id === m.variantId);
    return { ...m.toJSON(), productName: product?.name ?? "Produto removido", variantName: variant?.name ?? "—" };
  });

  const lowStockColumns: TableColumn<LowStockRow>[] = [
    { header: "Item", cell: (r) => <span className="font-medium">{r.name}</span> },
    { header: "Detalhe", cell: (r) => r.detail },
    { header: "Quantidade", cell: (r) => <Badge variant={r.quantity === 0 ? "danger" : "warning"}>{r.quantity}</Badge> },
  ];

  const movementColumns: TableColumn<(typeof recentMovements)[number]>[] = [
    { header: "Data", cell: (m) => new Date(m.createdAt).toLocaleString("pt-BR") },
    { header: "Categoria", cell: (m) => m.productName },
    { header: "Item", cell: (m) => m.variantName },
    { header: "Tipo", cell: (m) => <Badge variant={TYPE_BADGE[m.type]}>{TYPE_LABEL[m.type]}</Badge> },
    { header: "Quantidade", cell: (m) => m.quantity },
  ];

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">Central de Estoque</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard label="Categorias cadastradas" value={productsJSON.length} />
        <SummaryCard label="Matérias-primas cadastradas" value={materialsJSON.length} />
        <SummaryCard label="Itens com estoque baixo" value={lowStockRows.length} />
        <SummaryCard label="Movimentações no mês" value={movementsThisMonth.length} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Itens com estoque baixo</h2>
        <Table
          data={lowStockRows}
          columns={lowStockColumns}
          getRowKey={(r) => r.key}
          emptyMessage="Nenhum item com estoque baixo"
        />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Últimas movimentações</h2>
          <Link href="/estoque/movimentacoes" className="text-sm font-medium text-blue-600 hover:underline">
            Ver todas
          </Link>
        </div>
        <Table
          data={recentMovements}
          columns={movementColumns}
          getRowKey={(m) => m.id}
          emptyMessage="Nenhuma movimentação registrada ainda"
        />
      </section>
    </main>
  );
}
