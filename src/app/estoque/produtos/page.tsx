import { productService, categoryService } from "@/lib/container";
import { ProductsClient } from "./ProductsClient";

export const dynamic = "force-dynamic";

export default async function ProdutosPage() {
  const [products, categories] = await Promise.all([
    productService.listProducts(),
    categoryService.listCategories(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">Produtos</h1>
      <ProductsClient
        products={products.map((p) => p.toJSON())}
        categories={categories.map((c) => c.toJSON())}
      />
    </main>
  );
}
