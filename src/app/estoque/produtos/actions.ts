"use server";

import { revalidatePath } from "next/cache";
import { productService, categoryService } from "@/lib/container";

export async function createCategoryAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  await categoryService.createCategory({ name });
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function renameCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId"));
  const name = String(formData.get("name") ?? "");
  await categoryService.renameCategory(categoryId, name);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function deleteCategoryAction(formData: FormData) {
  const categoryId = String(formData.get("categoryId"));
  await categoryService.deleteCategory(categoryId);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function createProductAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const unit = String(formData.get("unit") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  const variationLabel = String(formData.get("variationLabel") ?? "");
  const variantNames = formData.getAll("variantName") as string[];
  const variantQuantities = formData.getAll("variantQuantity") as string[];

  const variants = variantNames
    .map((vName, i) => ({ name: vName, quantity: Number(variantQuantities[i] ?? 0) }))
    .filter((v) => v.name.trim().length > 0);

  await productService.createProduct({ name, unit, categoryId, variationLabel, variants });
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function moveProductToCategoryAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const categoryId = String(formData.get("categoryId") ?? "") || null;
  await productService.moveProductToCategory(productId, categoryId);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function addVariantAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const name = String(formData.get("name"));
  const quantity = Number(formData.get("quantity") ?? 0);
  await productService.addVariant(productId, { name, quantity });
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function adjustVariantQuantityAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  const quantity = Number(formData.get("quantity"));
  await productService.adjustVariantQuantity(productId, variantId, quantity);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function removeVariantAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  const variantId = String(formData.get("variantId"));
  await productService.removeVariant(productId, variantId);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}

export async function deleteProductAction(formData: FormData) {
  const productId = String(formData.get("productId"));
  await productService.deleteProduct(productId);
  revalidatePath("/estoque/produtos");
  revalidatePath("/estoque");
}
