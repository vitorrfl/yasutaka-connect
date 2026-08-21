import { beforeEach, describe, expect, it } from "vitest";
import { Product } from "@/domain/entities/Product";
import { ProductVariant } from "@/domain/entities/ProductVariant";
import { Sale, SaleType } from "@/domain/entities/Sale";
import { StockMovement, StockMovementType } from "@/domain/entities/StockMovement";
import type { ProductRepository } from "@/domain/repositories/ProductRepository";
import type { SaleRepository } from "@/domain/repositories/SaleRepository";
import type { StockMovementRepository } from "@/domain/repositories/StockMovementRepository";
import { SaleService } from "./SaleService";

/**
 * Dublês em memória. O domínio não conhece o Firebase, então dá pra exercitar
 * toda a regra de negócio sem subir nada — que é justamente a vantagem da
 * arquitetura em camadas.
 */
class FakeProductRepo implements ProductRepository {
  produtos = new Map<string, Product>();
  salvos: Product[] = [];
  async findAll() { return [...this.produtos.values()]; }
  async findById(id: string) { return this.produtos.get(id) ?? null; }
  async save(p: Product) { this.salvos.push(p); this.produtos.set(p.id, p); }
  async delete(id: string) { this.produtos.delete(id); }
}

class FakeSaleRepo implements SaleRepository {
  salvas: Sale[] = [];
  proximo = 1;
  async findAll() { return this.salvas; }
  async findById(id: string) { return this.salvas.find((s) => s.id === id) ?? null; }
  async save(s: Sale) { this.salvas.push(s); }
  async nextNumber() { return this.proximo++; }
}

class FakeMovementRepo implements StockMovementRepository {
  salvos: StockMovement[] = [];
  async findAll() { return this.salvos; }
  async save(m: StockMovement) { this.salvos.push(m); }
}

let produtos: FakeProductRepo;
let vendas: FakeSaleRepo;
let movimentos: FakeMovementRepo;
let service: SaleService;
let variacao: ProductVariant;
let produto: Product;

beforeEach(() => {
  produtos = new FakeProductRepo();
  vendas = new FakeSaleRepo();
  movimentos = new FakeMovementRepo();
  service = new SaleService(vendas, produtos, movimentos);

  variacao = ProductVariant.create({ name: "M", quantity: 10, price: 2500 });
  produto = Product.create({ name: "Camiseta", unit: "un", variants: [variacao] });
  produtos.produtos.set(produto.id, produto);
});

const linha = (over: Record<string, unknown> = {}) => ({
  productId: produto.id,
  variantId: variacao.id,
  quantity: 2,
  ...over,
});

describe("createSale — venda com estoque suficiente", () => {
  it("baixa o estoque e registra uma SAÍDA", async () => {
    const venda = await service.createSale({ items: [linha()] });

    expect(variacao.quantity).toBe(8);
    expect(produtos.salvos).toHaveLength(1);
    expect(movimentos.salvos).toHaveLength(1);
    expect(movimentos.salvos[0].type).toBe(StockMovementType.SAIDA);
    expect(movimentos.salvos[0].quantity).toBe(2);
    expect(movimentos.salvos[0].reason).toContain(`#${venda.number}`);
    expect(vendas.salvas).toHaveLength(1);
  });

  it("usa o preço da variação quando o item não traz preço", async () => {
    const venda = await service.createSale({ items: [linha()] });
    expect(venda.items[0].unitPrice).toBe(2500);
    expect(venda.total).toBe(5000);
  });

  it("respeita o preço editado na venda", async () => {
    const venda = await service.createSale({ items: [linha({ unitPrice: 1999 })] });
    expect(venda.items[0].unitPrice).toBe(1999);
  });

  it("congela nome, variação e unidade na nota", async () => {
    const venda = await service.createSale({ items: [linha()] });
    expect(venda.items[0].productName).toBe("Camiseta");
    expect(venda.items[0].variantName).toBe("M");
    expect(venda.items[0].unit).toBe("un");
  });
});

describe("createSale — item acima do estoque", () => {
  // Regra do commit 9458bb4: serviços e itens sem controle de estoque devem
  // poder ser vendidos mesmo sem saldo — sem baixar e sem ficar negativo.
  it("vende assim mesmo, sem baixar estoque nem movimentar", async () => {
    const venda = await service.createSale({ items: [linha({ quantity: 50 })] });

    expect(venda.items[0].quantity).toBe(50);
    expect(variacao.quantity).toBe(10);
    expect(movimentos.salvos).toHaveLength(0);
    expect(produtos.salvos).toHaveLength(0);
    expect(vendas.salvas).toHaveLength(1);
  });

  it("o estoque nunca fica negativo", async () => {
    await service.createSale({ items: [linha({ quantity: 999 })] });
    expect(variacao.quantity).toBeGreaterThanOrEqual(0);
  });

  it("numa venda mista, baixa só a linha que tem saldo", async () => {
    const outra = ProductVariant.create({ name: "G", quantity: 1, price: 3000 });
    const p2 = Product.create({ name: "Boné", variants: [outra] });
    produtos.produtos.set(p2.id, p2);

    await service.createSale({
      items: [linha({ quantity: 2 }), { productId: p2.id, variantId: outra.id, quantity: 5 }],
    });

    expect(variacao.quantity).toBe(8);
    expect(outra.quantity).toBe(1);
    expect(movimentos.salvos).toHaveLength(1);
    expect(movimentos.salvos[0].variantId).toBe(variacao.id);
  });
});

describe("createSale — orçamento", () => {
  it("não encosta no estoque", async () => {
    const orcamento = await service.createSale({ items: [linha()], type: SaleType.ORCAMENTO });

    expect(orcamento.isQuote).toBe(true);
    expect(variacao.quantity).toBe(10);
    expect(movimentos.salvos).toHaveLength(0);
    expect(produtos.salvos).toHaveLength(0);
    expect(vendas.salvas).toHaveLength(1);
  });
});

describe("createSale — erros", () => {
  it("recusa venda sem itens", async () => {
    await expect(service.createSale({ items: [] })).rejects.toThrow(/ao menos um item/i);
  });

  it("recusa produto inexistente", async () => {
    await expect(service.createSale({ items: [linha({ productId: "nao-existe" })] })).rejects.toThrow(
      /Produto não encontrado/i
    );
  });

  it("recusa variação inexistente", async () => {
    await expect(service.createSale({ items: [linha({ variantId: "nao-existe" })] })).rejects.toThrow(
      /Variação não encontrada/i
    );
  });

  it("recusa quantidade não positiva", async () => {
    await expect(service.createSale({ items: [linha({ quantity: 0 })] })).rejects.toThrow(/positiva/i);
  });

  it("não persiste nada quando um item posterior é inválido", async () => {
    // Valida tudo em memória antes de gravar; falha no meio não pode deixar
    // estoque baixado sem a venda correspondente.
    await expect(
      service.createSale({ items: [linha(), linha({ variantId: "nao-existe" })] })
    ).rejects.toThrow();

    expect(vendas.salvas).toHaveLength(0);
    expect(produtos.salvos).toHaveLength(0);
    expect(movimentos.salvos).toHaveLength(0);
  });
});

describe("createSale — numeração", () => {
  it("consome um número sequencial por venda", async () => {
    const a = await service.createSale({ items: [linha({ quantity: 1 })] });
    const b = await service.createSale({ items: [linha({ quantity: 1 })] });
    expect(a.number).toBe(1);
    expect(b.number).toBe(2);
  });
});
