import { Entity } from "./Entity";

export interface ProductVariantProps {
  name: string;
  sku?: string;
  quantity: number;
  /** Preço de venda em centavos (inteiro). 0 = sem preço definido ainda. */
  price: number;
}

export type ProductVariantJSON = {
  id: string;
  name: string;
  quantity: number;
  sku: string | null;
  /** Preço de venda em centavos. */
  price: number;
};

export class ProductVariant extends Entity<ProductVariantProps> {
  private constructor(props: ProductVariantProps, id: string) {
    super(props, id);
  }

  static create(
    input: { name: string; quantity?: number; sku?: string; price?: number },
    id?: string
  ): ProductVariant {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Nome da variação é obrigatório");
    }
    const quantity = input.quantity ?? 0;
    if (quantity < 0) {
      throw new Error("Quantidade não pode ser negativa");
    }
    const price = input.price ?? 0;
    if (price < 0) {
      throw new Error("Preço não pode ser negativo");
    }
    return new ProductVariant(
      { name, quantity, sku: input.sku?.trim() || undefined, price: Math.round(price) },
      id ?? crypto.randomUUID()
    );
  }

  get name(): string {
    return this.props.name;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get sku(): string | undefined {
    return this.props.sku;
  }

  /** Preço de venda em centavos. */
  get price(): number {
    return this.props.price;
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nome da variação é obrigatório");
    this.props.name = trimmed;
  }

  /** Define o preço de venda (em centavos). */
  setPrice(price: number): void {
    if (price < 0) throw new Error("Preço não pode ser negativo");
    this.props.price = Math.round(price);
  }

  increment(amount: number): void {
    if (amount <= 0) throw new Error("Quantidade a incrementar deve ser positiva");
    this.props.quantity += amount;
  }

  decrement(amount: number): void {
    if (amount <= 0) throw new Error("Quantidade a decrementar deve ser positiva");
    if (amount > this.props.quantity) {
      throw new Error(
        `Estoque insuficiente para "${this.props.name}": disponível ${this.props.quantity}, solicitado ${amount}`
      );
    }
    this.props.quantity -= amount;
  }

  setQuantity(quantity: number): void {
    if (quantity < 0) throw new Error("Quantidade não pode ser negativa");
    this.props.quantity = quantity;
  }

  toJSON(): ProductVariantJSON {
    return {
      id: this.id,
      name: this.props.name,
      quantity: this.props.quantity,
      sku: this.props.sku ?? null,
      price: this.props.price,
    };
  }
}
