import { Product } from "@/domain/entities/Product";
import { ProductVariant } from "@/domain/entities/ProductVariant";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async listProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async createProduct(input: {
    name: string;
    unit?: string;
    variants?: { name: string; quantity: number }[];
  }): Promise<Product> {
    const variants = (input.variants ?? [])
      .filter((v) => v.name.trim().length > 0)
      .map((v) => ProductVariant.create(v));
    const product = Product.create({ name: input.name, unit: input.unit, variants });
    await this.repository.save(product);
    return product;
  }

  async addVariant(productId: string, input: { name: string; quantity: number }): Promise<Product> {
    const product = await this.getOrThrow(productId);
    product.addVariant(ProductVariant.create(input));
    await this.repository.save(product);
    return product;
  }

  async adjustVariantQuantity(
    productId: string,
    variantId: string,
    quantity: number
  ): Promise<Product> {
    const product = await this.getOrThrow(productId);
    const variant = product.findVariant(variantId);
    if (!variant) throw new Error("Variação não encontrada");
    variant.setQuantity(quantity);
    await this.repository.save(product);
    return product;
  }

  async removeVariant(productId: string, variantId: string): Promise<Product> {
    const product = await this.getOrThrow(productId);
    product.removeVariant(variantId);
    await this.repository.save(product);
    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    await this.repository.delete(productId);
  }

  private async getOrThrow(productId: string): Promise<Product> {
    const product = await this.repository.findById(productId);
    if (!product) throw new Error("Produto não encontrado");
    return product;
  }
}
