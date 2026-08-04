"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatBRL } from "@/lib/money";
import { SaleType, type SaleJSON } from "@/domain/entities/Sale";

export function NotaClient({ sale }: { sale: SaleJSON }) {
  const createdAt = new Date(sale.createdAt).toLocaleString("pt-BR");
  const isQuote = sale.type === SaleType.ORCAMENTO;
  const title = isQuote ? "Orçamento" : "Pedido de Venda";

  return (
    <main className="mx-auto max-w-md px-4 py-6 sm:py-10">
      {/* Ações — escondidas na impressão */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href="/vendas" className="text-sm font-medium text-blue-600 hover:underline">
          ← Menu de Vendas
        </Link>
        <Button onClick={() => window.print()}>Imprimir</Button>
      </div>

      {/* A notinha */}
      <div className="nota mx-auto max-w-[80mm] rounded-xl border border-slate-200/70 bg-white p-6 font-mono text-[13px] leading-relaxed text-slate-900 shadow-card print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="text-center">
          <div className="text-base font-bold tracking-tight">Yasutaka Connect</div>
          <div className="font-semibold uppercase text-slate-600">{title}</div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="flex justify-between">
          <span className="text-slate-500">Nº</span>
          <span className="font-bold">{sale.number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Data</span>
          <span>{createdAt}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Cliente</span>
          <span className="font-medium">{sale.customerName ?? "Cliente Diversos"}</span>
        </div>
        {sale.sellerName && (
          <div className="flex justify-between">
            <span className="text-slate-500">Vendedor</span>
            <span className="font-medium">{sale.sellerName}</span>
          </div>
        )}

        <div className="my-3 border-t border-dashed border-slate-300" />

        <ul className="flex flex-col gap-2">
          {sale.items.map((item) => (
            <li key={item.id}>
              <div className="font-medium">
                {item.productName}
                <span className="font-normal text-slate-500"> · {item.variantName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>
                  {String(item.quantity).replace(".", ",")} × {formatBRL(item.unitPrice)}
                  {item.discount > 0 && <span className="text-slate-400"> (−{formatBRL(item.discount)})</span>}
                </span>
                <span className="font-semibold text-slate-900">{formatBRL(item.lineTotal)}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <div className="flex flex-col gap-0.5">
          <div className="flex justify-between text-slate-600">
            <span>Valor dos itens</span>
            <span>{formatBRL(sale.grossItems)}</span>
          </div>
          {sale.discountTotal > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>(−) Desconto</span>
              <span>{formatBRL(sale.discountTotal)}</span>
            </div>
          )}
          {sale.freight > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Frete</span>
              <span>{formatBRL(sale.freight)}</span>
            </div>
          )}
          <div className="mt-1 flex items-baseline justify-between border-t border-dashed border-slate-300 pt-1">
            <span className="font-semibold">TOTAL</span>
            <span className="text-lg font-bold">{formatBRL(sale.total)}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-slate-300" />

        <p className="text-center text-[11px] text-slate-500">
          {isQuote ? (
            <>Orçamento sujeito a confirmação.<br />Valores podem mudar.</>
          ) : (
            <>Leve esta nota ao caixa para efetuar o pagamento.<br />Documento sem valor fiscal.</>
          )}
        </p>
      </div>
    </main>
  );
}
