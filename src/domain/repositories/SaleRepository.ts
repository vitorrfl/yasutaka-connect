import { Sale } from "../entities/Sale";

export interface SaleRepository {
  findAll(): Promise<Sale[]>;
  findById(id: string): Promise<Sale | null>;
  save(sale: Sale): Promise<void>;
  /** Aloca (de forma atômica) o próximo número sequencial de pedido. */
  nextNumber(): Promise<number>;
}
