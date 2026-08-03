import { productService } from "@/lib/container";
import { PdvClient } from "./PdvClient";

export const dynamic = "force-dynamic";

export default async function PdvPage() {
  const products = await productService.listProducts();

  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col px-4 pt-6 md:h-dvh md:px-6 md:pt-8">
      <h1 className="mb-4 shrink-0 text-xl font-semibold text-slate-900 sm:text-2xl">PDV — Novo pedido</h1>
      <PdvClient products={products.map((p) => p.toJSON())} />
    </main>
  );
}
