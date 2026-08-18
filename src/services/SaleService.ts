import { Sale, SaleType } from "@/domain/entities/Sale";
import { Product } from "@/domain/entities/Product";
import { StockMovement, StockMovementType } from "@/domain/entities/StockMovement";
import type { SaleRepository } from "@/domain/repositories/SaleRepository";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { StockMovementRepository } from "@/domain/repositories/StockMovementRepository";

export interface SaleItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  /** Preço unitário em centavos. Se omitido, usa o preço fixo da variação. */
  unitPrice?: number;
  /** Desconto da linha em centavos (valor absoluto). */
  discount?: number;
}

export class SaleService {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
    private readonly movementRepository: StockMovementRepository
  ) {}

  async listSales(): Promise<Sale[]> {
    return this.saleRepository.findAll();
  }

  async getSale(id: string): Promise<Sale | null> {
    return this.saleRepository.findById(id);
  }

  /**
   * Finaliza uma venda (ou orçamento). Para VENDA: valida o estoque de todos os
   * itens, baixa as quantidades e registra uma SAÍDA por item. Para ORÇAMENTO:
   * nada de estoque — só gera a nota. Toda a validação acontece em memória antes
   * de qualquer gravação, então uma falha não deixa persistência pela metade.
   */
  async createSale(input: {
    items: SaleItemInput[];
    type?: SaleType;
    customerName?: string;
    sellerName?: string;
    freight?: number;
    note?: string;
  }): Promise<Sale> {
    if (!input.items?.length) {
      throw new Error("A venda precisa de ao menos um item");
    }
    const isQuote = input.type === SaleType.ORCAMENTO;

    // Carrega cada produto uma única vez (vários itens podem ser do mesmo produto).
    const products = new Map<string, Product>();
    for (const item of input.items) {
      if (!products.has(item.productId)) {
        const product = await this.productRepository.findById(item.productId);
        if (!product) throw new Error("Produto não encontrado");
        products.set(item.productId, product);
      }
    }

    // Monta snapshots dos itens. Em VENDA, baixa o estoque só de quem tem
    // saldo suficiente — itens acima do estoque (ex.: serviços sem controle)
    // são vendidos mesmo assim, sem baixa e sem movimentação (não fica negativo).
    const changedProducts = new Set<string>();
    const movements: { productId: string; variantId: string; quantity: number }[] = [];
    const saleItemInputs = input.items.map((item) => {
      const product = products.get(item.productId)!;
      const variant = product.findVariant(item.variantId);
      if (!variant) throw new Error("Variação não encontrada");
      if (item.quantity <= 0) throw new Error("Quantidade do item deve ser positiva");

      if (!isQuote && variant.quantity >= item.quantity) {
        variant.decrement(item.quantity);
        changedProducts.add(product.id);
        movements.push({ productId: product.id, variantId: variant.id, quantity: item.quantity });
      }

      return {
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        unit: product.unit,
        unitPrice: item.unitPrice ?? variant.price,
        quantity: item.quantity,
        discount: item.discount ?? 0,
      };
    });

    const number = await this.saleRepository.nextNumber();
    const sale = Sale.create({
      number,
      type: input.type,
      items: saleItemInputs,
      customerName: input.customerName,
      sellerName: input.sellerName,
      freight: input.freight,
      note: input.note,
    });

    // Persistência (após toda a validação). Grava só os produtos que baixaram
    // estoque e registra uma SAÍDA apenas por item efetivamente baixado.
    for (const product of products.values()) {
      if (changedProducts.has(product.id)) await this.productRepository.save(product);
    }
    for (const m of movements) {
      const movement = StockMovement.create({
        productId: m.productId,
        variantId: m.variantId,
        type: StockMovementType.SAIDA,
        quantity: m.quantity,
        reason: `Venda #${sale.number}`,
      });
      await this.movementRepository.save(movement);
    }
    await this.saleRepository.save(sale);

    return sale;
  }
}
