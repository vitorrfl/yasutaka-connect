import { Entity } from "./Entity";

export interface SaleItemProps {
  productId: string;
  variantId: string;
  /** Snapshots — congelados no momento da venda, para a nota não mudar se o produto mudar depois. */
  productName: string;
  variantName: string;
  unit: string;
  /** Preço unitário em centavos (pode ter sido editado na venda, diferente do preço fixo). */
  unitPrice: number;
  quantity: number;
  /** Desconto da linha em centavos (valor absoluto, já resolvido de % quando for o caso). */
  discount: number;
}

export type SaleItemJSON = {
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  /** Bruto da linha (unitPrice × quantity), em centavos. */
  grossTotal: number;
  /** Líquido da linha (bruto − desconto), em centavos. */
  lineTotal: number;
};

/** Linha de uma venda: um produto/variação com preço, quantidade e desconto. */
export class SaleItem extends Entity<SaleItemProps> {
  private constructor(props: SaleItemProps, id: string) {
    super(props, id);
  }

  static create(
    input: {
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      unit?: string;
      unitPrice: number;
      quantity: number;
      discount?: number;
    },
    id?: string
  ): SaleItem {
    if (!input.productId || !input.variantId) {
      throw new Error("Item da venda precisa de produto e variação");
    }
    if (input.quantity <= 0) {
      throw new Error("Quantidade do item deve ser positiva");
    }
    if (input.unitPrice < 0) {
      throw new Error("Preço do item não pode ser negativo");
    }
    const unitPrice = Math.round(input.unitPrice);
    const gross = unitPrice * input.quantity;
    // Desconto não pode ser negativo nem maior que o bruto da linha.
    const discount = Math.min(Math.max(0, Math.round(input.discount ?? 0)), gross);
    return new SaleItem(
      {
        productId: input.productId,
        variantId: input.variantId,
        productName: input.productName.trim(),
        variantName: input.variantName.trim(),
        unit: input.unit?.trim() || "un",
        unitPrice,
        quantity: input.quantity,
        discount,
      },
      id ?? crypto.randomUUID()
    );
  }

  static reconstruct(props: SaleItemProps, id: string): SaleItem {
    return new SaleItem(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get variantId(): string {
    return this.props.variantId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get variantName(): string {
    return this.props.variantName;
  }

  get unit(): string {
    return this.props.unit;
  }

  get unitPrice(): number {
    return this.props.unitPrice;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get discount(): number {
    return this.props.discount;
  }

  /** Bruto da linha (unitPrice × quantity), em centavos. */
  get grossTotal(): number {
    return this.props.unitPrice * this.props.quantity;
  }

  /** Líquido da linha (bruto − desconto), em centavos. */
  get lineTotal(): number {
    return this.grossTotal - this.props.discount;
  }

  toJSON(): SaleItemJSON {
    return {
      id: this.id,
      productId: this.props.productId,
      variantId: this.props.variantId,
      productName: this.props.productName,
      variantName: this.props.variantName,
      unit: this.props.unit,
      unitPrice: this.props.unitPrice,
      quantity: this.props.quantity,
      discount: this.props.discount,
      grossTotal: this.grossTotal,
      lineTotal: this.lineTotal,
    };
  }
}
