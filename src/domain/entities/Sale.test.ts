import { describe, expect, it } from "vitest";
import { Sale, SaleType } from "./Sale";

const item = (over: Partial<Parameters<typeof Sale.create>[0]["items"][number]> = {}) => ({
  productId: "p1",
  variantId: "v1",
  productName: "Camiseta",
  variantName: "M",
  unitPrice: 2500,
  quantity: 2,
  ...over,
});

describe("Sale.create — validação", () => {
  it("recusa venda sem itens", () => {
    expect(() => Sale.create({ number: 1, items: [] })).toThrow(/ao menos um item/i);
  });

  it("nasce como VENDA quando o tipo não é informado", () => {
    const sale = Sale.create({ number: 1, items: [item()] });
    expect(sale.type).toBe(SaleType.VENDA);
    expect(sale.isQuote).toBe(false);
  });

  it("reconhece orçamento", () => {
    expect(Sale.create({ number: 1, type: SaleType.ORCAMENTO, items: [item()] }).isQuote).toBe(true);
  });
});

describe("Sale — totais", () => {
  it("total é bruto − desconto + frete", () => {
    const sale = Sale.create({
      number: 1,
      freight: 1500,
      items: [item({ unitPrice: 2500, quantity: 2, discount: 500 }), item({ unitPrice: 1000, quantity: 3 })],
    });
    expect(sale.grossItems).toBe(8000);
    expect(sale.discountTotal).toBe(500);
    expect(sale.total).toBe(9000);
  });

  it("frete negativo vira zero — nunca abate do total", () => {
    const sale = Sale.create({ number: 1, freight: -5000, items: [item()] });
    expect(sale.freight).toBe(0);
    expect(sale.total).toBe(5000);
  });

  it("frete ausente conta como zero", () => {
    expect(Sale.create({ number: 1, items: [item()] }).freight).toBe(0);
  });

  it("itemCount soma quantidades, não linhas", () => {
    const sale = Sale.create({ number: 1, items: [item({ quantity: 2 }), item({ quantity: 3 })] });
    expect(sale.items).toHaveLength(2);
    expect(sale.itemCount).toBe(5);
  });

  it("desconto que zera a linha não deixa o total negativo", () => {
    const sale = Sale.create({ number: 1, items: [item({ unitPrice: 1000, quantity: 1, discount: 999999 })] });
    expect(sale.total).toBe(0);
  });
});

describe("Sale — identificação", () => {
  it("gera código no formato ddMM-HHmmss", () => {
    expect(Sale.create({ number: 7, items: [item()] }).code).toMatch(/^\d{4}-\d{6}$/);
  });

  it("guarda o número do pedido recebido", () => {
    expect(Sale.create({ number: 42, items: [item()] }).number).toBe(42);
  });

  it("nomes em branco viram indefinidos, não string vazia", () => {
    const sale = Sale.create({ number: 1, items: [item()], customerName: "   ", sellerName: "  Ana  " });
    expect(sale.customerName).toBeUndefined();
    expect(sale.sellerName).toBe("Ana");
  });

  it("toJSON usa null (e não undefined) para o que falta, pro Firestore aceitar", () => {
    const json = Sale.create({ number: 1, items: [item()] }).toJSON();
    expect(json.customerName).toBeNull();
    expect(json.sellerName).toBeNull();
    expect(json.note).toBeNull();
    expect(typeof json.createdAt).toBe("string");
  });
});
