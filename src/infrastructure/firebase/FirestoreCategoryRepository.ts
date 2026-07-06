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
import { Category } from "@/domain/entities/Category";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";

const COLLECTION = "categories";

export class FirestoreCategoryRepository implements CategoryRepository {
  async findAll(): Promise<Category[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => this.toDomain(d.id, d.data()));
  }

  async findById(id: string): Promise<Category | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return this.toDomain(snap.id, snap.data());
  }

  async save(category: Category): Promise<void> {
    await setDoc(doc(db, COLLECTION, category.id), this.toPersistence(category));
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  private toDomain(id: string, data: DocumentData): Category {
    return Category.reconstruct(
      {
        name: data.name,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      },
      id
    );
  }

  private toPersistence(category: Category) {
    const json = category.toJSON();
    return {
      name: json.name,
      createdAt: Timestamp.fromDate(category.createdAt),
      updatedAt: Timestamp.fromDate(category.updatedAt),
    };
  }
}
