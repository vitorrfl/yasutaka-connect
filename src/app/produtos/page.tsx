import { productService } from "@/lib/container";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const products = await productService.listProducts();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Estoque de Produtos</h1>
      <ProductsClient products={products.map((p) => p.toJSON())} />
    </main>
  );
}
