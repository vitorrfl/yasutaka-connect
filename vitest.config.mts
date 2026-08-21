import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Mesmo alias do tsconfig, pra os testes importarem "@/..." como o app.
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // `node` de propósito: estes testes cobrem domínio e serviços, que não
    // tocam DOM nem Firestore. Rodam em milissegundos e sem infraestrutura.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
