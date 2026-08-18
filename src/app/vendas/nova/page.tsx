import Link from "next/link";
import { productService } from "@/lib/container";
import { SaleType } from "@/domain/entities/Sale";
import { NovaVendaClient } from "./NovaVendaClient";

export const dynamic = "force-dynamic";

export default async function NovaVendaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const [{ tipo }, products] = await Promise.all([searchParams, productService.listProducts()]);
  const initialType = tipo === "orcamento" ? SaleType.ORCAMENTO : SaleType.VENDA;

  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] w-full max-w-5xl flex-col px-4 pt-6 md:h-dvh md:px-6 md:pt-8">
      <div className="mb-4 flex shrink-0 items-center gap-2">
        <Link
          href="/vendas"
          aria-label="Voltar ao Menu de Vendas"
          className="-ml-1.5 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
          {initialType === SaleType.ORCAMENTO ? "Novo orçamento" : "Nova venda"}
        </h1>
      </div>
      <NovaVendaClient products={products.map((p) => p.toJSON())} initialType={initialType} />
    </main>
  );
}
