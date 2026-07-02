import { productService, stockMovementService } from "@/lib/container";
import { EstoqueClient } from "./EstoqueClient";

export const dynamic = "force-dynamic";

export default async function EstoquePage() {
  const [products, movements] = await Promise.all([
    productService.listProducts(),
    stockMovementService.listMovements(),
  ]);

  const productsJSON = products.map((p) => p.toJSON());

  const movementsView = movements.map((m) => {
    const product = productsJSON.find((p) => p.id === m.productId);
    const variant = product?.variants.find((v) => v.id === m.variantId);
    return {
      ...m.toJSON(),
      productName: product?.name ?? "Produto removido",
      variantName: variant?.name ?? "—",
    };
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">Movimentações de Estoque</h1>
      <p className="mb-6 -mt-4 text-sm text-slate-500">Histórico de entradas, saídas e ajustes de produtos.</p>
      <EstoqueClient products={productsJSON} movements={movementsView} />
    </main>
  );
}
