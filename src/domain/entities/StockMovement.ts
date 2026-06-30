import { Entity } from "./Entity";

export enum StockMovementType {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA",
  AJUSTE = "AJUSTE",
}

export interface StockMovementProps {
  productId: string;
  variantId: string;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  createdAt: Date;
}

/**
 * Registro de movimentação de estoque (entrada/saída/ajuste).
 * Não é usado pela tela de produtos ainda — existe para já deixar o domínio
 * pronto para o PDV e para um futuro histórico/auditoria de estoque.
 */
export class StockMovement extends Entity<StockMovementProps> {
  private constructor(props: StockMovementProps, id: string) {
    super(props, id);
  }

  static create(
    input: {
      productId: string;
      variantId: string;
      type: StockMovementType;
      quantity: number;
      reason?: string;
    },
    id?: string
  ): StockMovement {
    if (input.quantity <= 0) {
      throw new Error("Quantidade da movimentação deve ser positiva");
    }
    return new StockMovement(
      { ...input, reason: input.reason?.trim() || undefined, createdAt: new Date() },
      id ?? crypto.randomUUID()
    );
  }

  static reconstruct(props: StockMovementProps, id: string): StockMovement {
    return new StockMovement(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get variantId(): string {
    return this.props.variantId;
  }

  get type(): StockMovementType {
    return this.props.type;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get reason(): string | undefined {
    return this.props.reason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  toJSON() {
    return {
      id: this.id,
      productId: this.props.productId,
      variantId: this.props.variantId,
      type: this.props.type,
      quantity: this.props.quantity,
      reason: this.props.reason ?? null,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
