import { ProductService } from "@/services/ProductService";
import { CategoryService } from "@/services/CategoryService";
import { StockMovementService } from "@/services/StockMovementService";
import { RawMaterialService } from "@/services/RawMaterialService";
import { SaleService } from "@/services/SaleService";
import { FirestoreProductRepository } from "@/infrastructure/firebase/FirestoreProductRepository";
import { FirestoreCategoryRepository } from "@/infrastructure/firebase/FirestoreCategoryRepository";
import { FirestoreStockMovementRepository } from "@/infrastructure/firebase/FirestoreStockMovementRepository";
import { FirestoreRawMaterialRepository } from "@/infrastructure/firebase/FirestoreRawMaterialRepository";
import { FirestoreSaleRepository } from "@/infrastructure/firebase/FirestoreSaleRepository";

const productRepository = new FirestoreProductRepository();
const stockMovementRepository = new FirestoreStockMovementRepository();

export const productService = new ProductService(productRepository);
export const categoryService = new CategoryService(new FirestoreCategoryRepository());
export const stockMovementService = new StockMovementService(stockMovementRepository, productRepository);
export const rawMaterialService = new RawMaterialService(new FirestoreRawMaterialRepository());
export const saleService = new SaleService(
  new FirestoreSaleRepository(),
  productRepository,
  stockMovementRepository
);
