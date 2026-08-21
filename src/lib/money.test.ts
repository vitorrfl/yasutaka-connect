import { describe, expect, it } from "vitest";
import { centsToInput, formatBRL, parseBRLToCents } from "./money";

/** Intl usa espaço NÃO-QUEBRÁVEL entre "R$" e o número; normaliza pra comparar. */
const normaliza = (s: string) => s.replace(/ /g, " ");

describe("parseBRLToCents", () => {
  it("lê o formato brasileiro", () => {
    expect(parseBRLToCents("19,90")).toBe(1990);
    expect(parseBRLToCents("0,05")).toBe(5);
    expect(parseBRLToCents("100")).toBe(10000);
  });

  it("trata ponto como milhar quando há vírgula", () => {
    expect(parseBRLToCents("1.234,56")).toBe(123456);
    expect(parseBRLToCents("1.000.000,00")).toBe(100000000);
  });

  it("trata ponto como decimal quando NÃO há vírgula", () => {
    expect(parseBRLToCents("19.90")).toBe(1990);
  });

  it("ignora símbolo de moeda e espaços", () => {
    expect(parseBRLToCents("R$ 19,90")).toBe(1990);
    expect(parseBRLToCents("  42,00  ")).toBe(4200);
  });

  it("devolve 0 para entrada inválida, vazia ou negativa", () => {
    expect(parseBRLToCents("")).toBe(0);
    expect(parseBRLToCents("abc")).toBe(0);
    expect(parseBRLToCents("-10,00")).toBe(0);
    expect(parseBRLToCents(null as unknown as string)).toBe(0);
  });

  it("arredonda em vez de truncar — meio centavo não some", () => {
    expect(parseBRLToCents("0,015")).toBe(2);
    expect(parseBRLToCents("19,999")).toBe(2000);
  });
});

describe("centsToInput", () => {
  it("converte centavos em texto editável", () => {
    expect(centsToInput(1990)).toBe("19,90");
    expect(centsToInput(5)).toBe("0,05");
    expect(centsToInput(123456)).toBe("1234,56");
  });

  it("devolve vazio para zero, pra o input não nascer com '0,00'", () => {
    expect(centsToInput(0)).toBe("");
  });
});

describe("ida e volta", () => {
  // A propriedade que realmente importa: digitar e reler não pode perder
  // dinheiro. É onde erro de ponto flutuante apareceria.
  it("preserva o valor em centavos", () => {
    for (const cents of [1, 5, 99, 100, 1990, 123456, 999999, 100000000]) {
      expect(parseBRLToCents(centsToInput(cents))).toBe(cents);
    }
  });
});

describe("formatBRL", () => {
  it("formata como moeda brasileira", () => {
    expect(normaliza(formatBRL(1990))).toBe("R$ 19,90");
    expect(normaliza(formatBRL(0))).toBe("R$ 0,00");
    expect(normaliza(formatBRL(123456))).toBe("R$ 1.234,56");
  });

  it("não quebra com valor não finito", () => {
    expect(normaliza(formatBRL(NaN))).toBe("R$ 0,00");
    expect(normaliza(formatBRL(Infinity))).toBe("R$ 0,00");
  });
});
