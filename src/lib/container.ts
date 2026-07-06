import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { StockMovementService } from "@/services/StockMovementService";
import { RawMaterialService } from "@/services/RawMaterialService";
import { FirestoreProductRepository } from "@/infrastructure/firebase/FirestoreProductRepository";
import { FirestoreCategoryRepository } from "@/infrastructure/firebase/FirestoreCategoryRepository";
import { FirestoreStockMovementRepository } from "@/infrastructure/firebase/FirestoreStockMovementRepository";
import { FirestoreRawMaterialRepository } from "@/infrastructure/firebase/FirestoreRawMaterialRepository";

const productRepository = new FirestoreProductRepository();

export const productService = new ProductService(productRepository);
export const categoryService = new CategoryService(new FirestoreCategoryRepository());
export const stockMovementService = new StockMovementService(
  new FirestoreStockMovementRepository(),
  productRepository
);
export const rawMaterialService = new RawMaterialService(new FirestoreRawMaterialRepository());
