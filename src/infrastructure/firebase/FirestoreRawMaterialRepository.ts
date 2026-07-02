import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RawMaterial } from "@/domain/entities/RawMaterial";
import type { RawMaterialRepository } from "@/domain/repositories/RawMaterialRepository";

const COLLECTION = "rawMaterials";

export class FirestoreRawMaterialRepository implements RawMaterialRepository {
  async findAll(): Promise<RawMaterial[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => this.toDomain(d.id, d.data()));
  }

  async findById(id: string): Promise<RawMaterial | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return this.toDomain(snap.id, snap.data());
  }

  async save(material: RawMaterial): Promise<void> {
    await setDoc(doc(db, COLLECTION, material.id), this.toPersistence(material));
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  private toDomain(id: string, data: DocumentData): RawMaterial {
    return RawMaterial.reconstruct(
      {
        name: data.name,
        unit: data.unit,
        quantity: data.quantity,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      },
      id
    );
  }

  private toPersistence(material: RawMaterial) {
    const json = material.toJSON();
    return {
      name: json.name,
      unit: json.unit,
      quantity: json.quantity,
      createdAt: Timestamp.fromDate(material.createdAt),
      updatedAt: Timestamp.fromDate(material.updatedAt),
    };
  }
}
