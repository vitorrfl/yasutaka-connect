import { Category } from "@/domain/entities/Category";
import type { CategoryRepository } from "@/domain/repositories/CategoryRepository";

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  async listCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async createCategory(input: { name: string }): Promise<Category> {
    const category = Category.create({ name: input.name });
    await this.repository.save(category);
    return category;
  }

  async renameCategory(id: string, name: string): Promise<Category> {
    const category = await this.getOrThrow(id);
    category.rename(name);
    await this.repository.save(category);
    return category;
  }

  /**
   * Remove apenas o agrupamento. Os produtos que apontavam para ela não são
   * apagados — passam a aparecer em "Sem categoria" até serem reorganizados.
   */
  async deleteCategory(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private async getOrThrow(id: string): Promise<Category> {
    const category = await this.repository.findById(id);
    if (!category) throw new Error("Categoria não encontrada");
    return category;
  }
}
