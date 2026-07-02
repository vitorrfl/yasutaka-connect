import { RawMaterial } from "@/domain/entities/RawMaterial";
import type { RawMaterialRepository } from "@/domain/repositories/RawMaterialRepository";

export class RawMaterialService {
  constructor(private readonly repository: RawMaterialRepository) {}

  async listMaterials(): Promise<RawMaterial[]> {
    return this.repository.findAll();
  }

  async createMaterial(input: { name: string; unit?: string; quantity?: number }): Promise<RawMaterial> {
    const material = RawMaterial.create(input);
    await this.repository.save(material);
    return material;
  }

  async adjustQuantity(materialId: string, quantity: number): Promise<RawMaterial> {
    const material = await this.getOrThrow(materialId);
    material.setQuantity(quantity);
    await this.repository.save(material);
    return material;
  }

  async deleteMaterial(materialId: string): Promise<void> {
    await this.repository.delete(materialId);
  }

  private async getOrThrow(materialId: string): Promise<RawMaterial> {
    const material = await this.repository.findById(materialId);
    if (!material) throw new Error("Matéria-prima não encontrada");
    return material;
  }
}
