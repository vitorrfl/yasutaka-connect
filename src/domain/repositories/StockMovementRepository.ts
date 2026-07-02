import { StockMovement } from "../entities/StockMovement";

export interface StockMovementRepository {
  findAll(): Promise<StockMovement[]>;
  save(movement: StockMovement): Promise<void>;
}
