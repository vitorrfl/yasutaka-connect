import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  runTransaction,
  query,
  orderBy,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Sale, SaleType } from "@/domain/entities/Sale";
import { SaleItem } from "@/domain/entities/SaleItem";
import type { SaleRepository } from "@/domain/repositories/SaleRepository";

const COLLECTION = "sales";
const COUNTER_DOC = doc(db, "counters", "sales");

type SaleItemData = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unit?: string | null;
  unitPrice: number;
  quantity: number;
  discount?: number | null;
};

export class FirestoreSaleRepository implements SaleRepository {
  async findAll(): Promise<Sale[]> {
    const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("createdAt", "desc")));
    return snapshot.docs.map((d) => this.toDomain(d.id, d.data()));
  }

  async findById(id: string): Promise<Sale | null> {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return this.toDomain(snap.id, snap.data());
  }

  async save(sale: Sale): Promise<void> {
    await setDoc(doc(db, COLLECTION, sale.id), this.toPersistence(sale));
  }

  /** Incrementa o contador de forma atômica e devolve o novo número. */
  async nextNumber(): Promise<number> {
    return runTransaction(db, async (tx) => {
      const snap = await tx.get(COUNTER_DOC);
      const current = snap.exists() ? ((snap.data().current as number) ?? 0) : 0;
      const next = current + 1;
      tx.set(COUNTER_DOC, { current: next }, { merge: true });
      return next;
    });
  }

  private toDomain(id: string, data: DocumentData): Sale {
    const items = ((data.items ?? []) as SaleItemData[]).map((i) =>
      SaleItem.reconstruct(
        {
          productId: i.productId,
          variantId: i.variantId,
          productName: i.productName,
          variantName: i.variantName,
          unit: i.unit ?? "un",
          unitPrice: i.unitPrice,
          quantity: i.quantity,
          discount: i.discount ?? 0,
        },
        i.id
      )
    );
    return Sale.reconstruct(
      {
        number: (data.number as number) ?? 0,
        code: data.code,
        type: (data.type as SaleType) ?? SaleType.VENDA,
        items,
        customerName: (data.customerName as string | null) ?? undefined,
        sellerName: (data.sellerName as string | null) ?? undefined,
        freight: (data.freight as number) ?? 0,
        note: (data.note as string | null) ?? undefined,
        createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
      },
      id
    );
  }

  private toPersistence(sale: Sale) {
    const json = sale.toJSON();
    return {
      number: json.number,
      code: json.code,
      type: json.type,
      // Persistimos os snapshots (nome/preço) — a nota não muda se o produto mudar depois.
      items: json.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        productName: i.productName,
        variantName: i.variantName,
        unit: i.unit,
        unitPrice: i.unitPrice,
        quantity: i.quantity,
        discount: i.discount,
      })),
      customerName: json.customerName,
      sellerName: json.sellerName,
      freight: json.freight,
      note: json.note,
      grossItems: json.grossItems,
      discountTotal: json.discountTotal,
      total: json.total,
      itemCount: json.itemCount,
      createdAt: Timestamp.fromDate(sale.createdAt),
    };
  }
}
