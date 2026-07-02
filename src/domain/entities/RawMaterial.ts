import { Entity } from "./Entity";

export interface RawMaterialProps {
  name: string;
  unit: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export type RawMaterialJSON = {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export class RawMaterial extends Entity<RawMaterialProps> {
  private constructor(props: RawMaterialProps, id: string) {
    super(props, id);
  }

  static create(input: { name: string; unit?: string; quantity?: number }, id?: string): RawMaterial {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Nome da matéria-prima é obrigatório");
    }
    const quantity = input.quantity ?? 0;
    if (quantity < 0) {
      throw new Error("Quantidade não pode ser negativa");
    }
    const now = new Date();
    return new RawMaterial(
      { name, unit: input.unit?.trim() || "un", quantity, createdAt: now, updatedAt: now },
      id ?? crypto.randomUUID()
    );
  }

  static reconstruct(props: RawMaterialProps, id: string): RawMaterial {
    return new RawMaterial(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get unit(): string {
    return this.props.unit;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nome da matéria-prima é obrigatório");
    this.props.name = trimmed;
    this.touch();
  }

  setQuantity(quantity: number): void {
    if (quantity < 0) throw new Error("Quantidade não pode ser negativa");
    this.props.quantity = quantity;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): RawMaterialJSON {
    return {
      id: this.id,
      name: this.props.name,
      unit: this.props.unit,
      quantity: this.props.quantity,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
