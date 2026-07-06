import { Entity } from "./Entity";

export interface CategoryProps {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryJSON = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Agrupamento de topo da árvore de estoque (ex.: "Carimbos", "Copos Stanley").
 * Serve só para organizar/navegar — a quantidade em si mora na Variação do Produto.
 */
export class Category extends Entity<CategoryProps> {
  private constructor(props: CategoryProps, id: string) {
    super(props, id);
  }

  static create(input: { name: string }, id?: string): Category {
    const name = input.name?.trim();
    if (!name) {
      throw new Error("Nome da categoria é obrigatório");
    }
    const now = new Date();
    return new Category({ name, createdAt: now, updatedAt: now }, id ?? crypto.randomUUID());
  }

  static reconstruct(props: CategoryProps, id: string): Category {
    return new Category(props, id);
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  rename(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Nome da categoria é obrigatório");
    this.props.name = trimmed;
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }

  toJSON(): CategoryJSON {
    return {
      id: this.id,
      name: this.props.name,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
