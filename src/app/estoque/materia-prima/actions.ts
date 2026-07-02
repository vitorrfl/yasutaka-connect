"use server";

import { revalidatePath } from "next/cache";
import { rawMaterialService } from "@/lib/container";

export async function createMaterialAction(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const unit = String(formData.get("unit") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);

  await rawMaterialService.createMaterial({ name, unit, quantity });
  revalidatePath("/estoque/materia-prima");
  revalidatePath("/estoque");
}

export async function adjustMaterialQuantityAction(formData: FormData) {
  const materialId = String(formData.get("materialId"));
  const quantity = Number(formData.get("quantity"));

  await rawMaterialService.adjustQuantity(materialId, quantity);
  revalidatePath("/estoque/materia-prima");
  revalidatePath("/estoque");
}

export async function deleteMaterialAction(formData: FormData) {
  const materialId = String(formData.get("materialId"));
  await rawMaterialService.deleteMaterial(materialId);
  revalidatePath("/estoque/materia-prima");
  revalidatePath("/estoque");
}
