import { ProductService } from "@/services/ProductService";
import { FirestoreProductRepository } from "@/infrastructure/firebase/FirestoreProductRepository";

export const productService = new ProductService(new FirestoreProductRepository());
