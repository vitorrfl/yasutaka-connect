"use server";

import { revalidatePath } from "next/cache";
import { saleService } from "@/lib/container";
import { SaleType } from "@/domain/entities/Sale";

export interface CreateSaleInput {
  items: { productId: string; variantId: string; quantity: number; unitPrice: number; discount: number }[];
  type?: SaleType;
  customerName?: string;
  sellerName?: string;
  freight?: number;
}

/** Finaliza a venda/orçamento (baixa estoque só em venda) e devolve o id da nota. */
export async function createSaleAction(input: CreateSaleInput): Promise<{ id: string }> {
  const sale = await saleService.createSale(input);
  // O estoque pode ter mudado → revalida as telas que o exibem.
  revalidatePath("/estoque");
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque/movimentacoes");
  return { id: sale.id };
}
