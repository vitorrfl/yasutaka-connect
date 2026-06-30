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
import { Product } from "@/domain/entities/Product";
import { ProductVariant } from "@/domain/entities/ProductVariant";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";

const COLLECTION = "products";

export class FirestoreProductRepository implements ProductRepository {
  async findAll(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map((d) => this.toDomain(d.id, d.data()));
  }

  async findById(id: string): Promise<Product | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return this.toDomain(snap.id, snap.data());
  }

  async save(product: Product): Promise<void> {
    await setDoc(doc(db, COLLECTION, product.id), this.toPersistence(product));
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  }

  private toDomain(id: string, data: DocumentData): Product {
    const variants = (data.variants ?? []).map(
      (v: { id: string; name: string; quantity: number; sku?: string | null }) =>
        ProductVariant.create({ name: v.name, quantity: v.quantity, sku: v.sku ?? undefined }, v.id)
    );
    return Product.reconstruct(
      {
        name: data.name,
        unit: data.unit,
        variants,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() ?? new Date(),
      },
      id
    );
  }

  private toPersistence(product: Product) {
    const json = product.toJSON();
    return {
      name: json.name,
      unit: json.unit,
      variants: json.variants,
      createdAt: Timestamp.fromDate(product.createdAt),
      updatedAt: Timestamp.fromDate(product.updatedAt),
    };
  }
}
