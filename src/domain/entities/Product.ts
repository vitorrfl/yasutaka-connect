import { Entity } from "./Entity";
import { ProductVariant, type ProductVariantJSON } from "./ProductVariant";

const DEFAULT_VARIANT_NAME = "Padrão";

export interface ProductProps {
  name: string;
  unit: string;
  /** Categoria (agrupamento de topo) a que pertence. null = "Sem categoria". */
  categoryId: string | null;
  /** Rótulo do eixo de variação — o "varia por": Cor, Medida, Modelo… undefined = genérico. */
  variationLabel?: string;
  variants: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProductJSON = {
  id: string;
  name: string;
  unit: string;
  categoryId: string | null;
  variationLabel: string | null;
  totalQuantity: number;
  variants: ProductVariantJSON[];
  createdAt: string;
  updatedAt: string;
};

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id: string) {
    super(props, id);
  }

  /** Cria um produto novo. Se nenhuma variação for informada, cria uma variação "Padrão" automaticamente. */
  static create(
    input: {
      name: string;
      unit?: string;
      categoryId?: string | null;
      variationLabel?: string;
      variants?: ProductVariant[];
    },
    id?: string
  ): Product {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Nome do produto é obrigatório");
    }
    const now = new Date();
    const variants = input.variants?.length
      ? input.variants
      : [ProductVariant.create({ name: DEFAULT_VARIANT_NAME, quantity: 0 })];

    return new Product(
      {
        name,
        unit: input.unit?.trim() || "un",
        categoryId: input.categoryId ?? null,
        variationLabel: input.variationLabel?.trim() || undefined,
        variants,
        createdAt: now,
        updatedAt: now,
      },
      id ?? crypto.randomUUID()
    );
  }

  /** Reidrata um produto já existente (ex: vindo do Firestore), preservando id e datas originais. */
  static reconstruct(props: ProductProps, id: string): Product {
    return new Product(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get unit(): string {
    return this.props.unit;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get variationLabel(): string | undefined {
    return this.props.variationLabel;
  }

  get variants(): readonly ProductVariant[] {
    return this.props.variants;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get totalQuantity(): number {
    return this.props.variants.reduce((sum, v) => sum + v.quantity, 0);
  }

  findVariant(variantId: string): ProductVariant | undefined {
    return this.props.variants.find((v) => v.id === variantId);
  }

  addVariant(variant: ProductVariant): void {
    const duplicate = this.props.variants.some(
      (v) => v.name.toLowerCase() === variant.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`Já existe uma variação "${variant.name}" para este produto`);
    }
    this.props.variants.push(variant);
    this.touch();
  }

  removeVariant(variantId: string): void {
    const index = this.props.variants.findIndex((v) => v.id === variantId);
    if (index === -1) throw new Error("Variação não encontrada");
    if (this.props.variants.length === 1) {
      throw new Error("O produto precisa ter ao menos uma variação");
    }
    this.props.variants.splice(index, 1);
    this.touch();
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nome do produto é obrigatório");
    this.props.name = trimmed;
    this.touch();
  }

  moveToCategory(categoryId: string | null): void {
    this.props.categoryId = categoryId;
    this.touch();
  }

  setVariationLabel(label: string | undefined): void {
    this.props.variationLabel = label?.trim() || undefined;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): ProductJSON {
    return {
      id: this.id,
      name: this.props.name,
      unit: this.props.unit,
      categoryId: this.props.categoryId,
      variationLabel: this.props.variationLabel ?? null,
      totalQuantity: this.totalQuantity,
      variants: this.props.variants.map((v) => v.toJSON()),
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
