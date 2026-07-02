import { RawMaterial } from "../entities/RawMaterial";

export interface RawMaterialRepository {
  findAll(): Promise<RawMaterial[]>;
  findById(id: string): Promise<RawMaterial | null>;
  save(material: RawMaterial): Promise<void>;
  delete(id: string): Promise<void>;
}
