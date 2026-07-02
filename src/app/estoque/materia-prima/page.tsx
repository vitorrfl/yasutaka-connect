import { rawMaterialService } from "@/lib/container";
import { MateriaPrimaClient } from "./MateriaPrimaClient";

export const dynamic = "force-dynamic";

export default async function MateriaPrimaPage() {
  const materials = await rawMaterialService.listMaterials();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">Matéria Prima</h1>
      <MateriaPrimaClient materials={materials.map((m) => m.toJSON())} />
    </main>
  );
}
