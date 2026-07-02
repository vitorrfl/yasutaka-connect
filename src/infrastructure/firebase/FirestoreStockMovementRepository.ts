import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StockMovement, StockMovementType } from "@/domain/entities/StockMovement";
import type { StockMovementRepository } from "@/domain/repositories/StockMovementRepository";

const COLLECTION = "stockMovements";

export class FirestoreStockMovementRepository implements StockMovementRepository {
  async findAll(): Promise<StockMovement[]> {
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    return snapshot.docs.map((d) => this.toDomain(d.id, d.data()));
  }

  async save(movement: StockMovement): Promise<void> {
    await setDoc(doc(db, COLLECTION, movement.id), this.toPersistence(movement));
  }

  private toDomain(id: string, data: DocumentData): StockMovement {
    return StockMovement.reconstruct(
      {
        productId: data.productId,
        variantId: data.variantId,
        type: data.type as StockMovementType,
        quantity: data.quantity,
        reason: data.reason ?? undefined,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      },
      id
    );
  }

  private toPersistence(movement: StockMovement) {
    const json = movement.toJSON();
    return {
      productId: json.productId,
      variantId: json.variantId,
      type: json.type,
      quantity: json.quantity,
      reason: json.reason,
      createdAt: Timestamp.fromDate(movement.createdAt),
    };
  }
}
