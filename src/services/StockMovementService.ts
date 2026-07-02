import { StockMovement, StockMovementType } from "@/domain/entities/StockMovement";
import type { StockMovementRepository } from "@/domain/repositories/StockMovementRepository";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";

export class StockMovementService {
  constructor(
    private readonly movementRepository: StockMovementRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async listMovements(): Promise<StockMovement[]> {
    return this.movementRepository.findAll();
  }

  async registerMovement(input: {
    productId: string;
    variantId: string;
    type: StockMovementType;
    quantity: number;
    reason?: string;
  }): Promise<StockMovement> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) throw new Error("Produto não encontrado");

    const variant = product.findVariant(input.variantId);
    if (!variant) throw new Error("Variação não encontrada");

    if (input.type === StockMovementType.AJUSTE) {
      variant.setQuantity(input.quantity);
    } else if (input.type === StockMovementType.ENTRADA) {
      variant.increment(input.quantity);
    } else {
      variant.decrement(input.quantity);
    }

    const movement = StockMovement.create(input);
    await this.productRepository.save(product);
    await this.movementRepository.save(movement);
    return movement;
  }
}
