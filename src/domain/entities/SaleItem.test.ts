import { describe, expect, it } from "vitest";
import { SaleItem } from "./SaleItem";

const base = {
  productId: "p1",
  variantId: "v1",
  productName: "Camiseta",
  variantName: "M",
  unitPrice: 2500,
  quantity: 2,
};

describe("SaleItem.create — validação", () => {
  it("exige produto e variação", () => {
    expect(() => SaleItem.create({ ...base, productId: "" })).toThrow(/produto e varia/i);
    expect(() => SaleItem.create({ ...base, variantId: "" })).toThrow(/produto e varia/i);
  });

  it("exige quantidade positiva", () => {
    expect(() => SaleItem.create({ ...base, quantity: 0 })).toThrow(/positiva/i);
    expect(() => SaleItem.create({ ...base, quantity: -1 })).toThrow(/positiva/i);
  });

  it("recusa preço negativo", () => {
    expect(() => SaleItem.create({ ...base, unitPrice: -1 })).toThrow(/negativo/i);
  });

  it("usa 'un' quando a unidade não vem", () => {
    expect(SaleItem.create(base).unit).toBe("un");
    expect(SaleItem.create({ ...base, unit: "   " }).unit).toBe("un");
    expect(SaleItem.create({ ...base, unit: " cx " }).unit).toBe("cx");
  });

  it("apara espaços dos nomes congelados na nota", () => {
    const item = SaleItem.create({ ...base, productName: "  Camiseta  ", variantName: " M " });
    expect(item.productName).toBe("Camiseta");
    expect(item.variantName).toBe("M");
  });
});

describe("SaleItem — desconto", () => {
  it("nunca passa do bruto da linha (não gera crédito)", () => {
    const item = SaleItem.create({ ...base, discount: 999999 });
    expect(item.discount).toBe(5000);
    expect(item.lineTotal).toBe(0);
  });

  it("nunca é negativo (não vira acréscimo disfarçado)", () => {
    expect(SaleItem.create({ ...base, discount: -500 }).discount).toBe(0);
  });

  it("desconto ausente conta como zero", () => {
    expect(SaleItem.create(base).discount).toBe(0);
  });
});

describe("SaleItem — totais", () => {
  it("bruto é preço × quantidade, líquido desconta", () => {
    const item = SaleItem.create({ ...base, discount: 500 });
    expect(item.grossTotal).toBe(5000);
    expect(item.lineTotal).toBe(4500);
  });

  it("arredonda o preço unitário para centavo inteiro", () => {
    // Centavo fracionado não existe: se entrasse, o total acumularia erro.
    expect(SaleItem.create({ ...base, unitPrice: 2500.6 }).unitPrice).toBe(2501);
  });

  it("toJSON expõe os totais calculados", () => {
    const json = SaleItem.create({ ...base, discount: 500 }).toJSON();
    expect(json).toMatchObject({ unitPrice: 2500, quantity: 2, discount: 500, grossTotal: 5000, lineTotal: 4500 });
  });
});
