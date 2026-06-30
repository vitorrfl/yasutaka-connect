"use server";

import { revalidatePath } from "next/cache";
import { productService } from "@/lib/container";

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const unit = String(formData.get("unit") ?? "");
  const variantNames = formData.getAll("variantName") as string[];
  const variantQuantities = formData.getAll("variantQuantity") as string[];

  const variants = variantNames
    .map((vName, i) => ({ name: vName, quantity: Number(variantQuantities[i] ?? 0) }))
    .filter((v) => v.name.trim().length > 0);

  await productService.createProduct({ name, unit, variants });
  revalidatePath("/produtos");
}

export async function addVariantAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const name = String(formData.get("name"));
  const quantity = Number(formData.get("quantity") ?? 0);
  await productService.addVariant(productId, { name, quantity });
  revalidatePath("/produtos");
}

export async function adjustVariantQuantityAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  const quantity = Number(formData.get("quantity"));
  await productService.adjustVariantQuantity(productId, variantId, quantity);
  revalidatePath("/produtos");
}

export async function removeVariantAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  await productService.removeVariant(productId, variantId);
  revalidatePath("/produtos");
}

export async function deleteProductAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  await productService.deleteProduct(productId);
  revalidatePath("/produtos");
}
