"use server";

import { revalidatePath } from "next/cache";
import { stockMovementService } from "@/lib/container";
import { StockMovementType } from "@/domain/entities/StockMovement";

export async function registerMovementAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  const type = String(formData.get("type")) as StockMovementType;
  const quantity = Number(formData.get("quantity"));
  const reason = String(formData.get("reason") ?? "");

  await stockMovementService.registerMovement({
    productId,
    variantId,
    type,
    quantity,
    reason: reason || undefined,
  });

  revalidatePath("/estoque/movimentacoes");
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}
