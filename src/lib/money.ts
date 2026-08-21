/**
 * Dinheiro é sempre representado em **centavos** (inteiro) no domínio e na
 * persistência — nunca em reais com casas decimais — para evitar erros de
 * ponto flutuante. Estas funções fazem a ponte com o texto exibido/digitado.
 */

/** Converte centavos em texto editável para inputs: `1990` → `"19,90"` (vazio se 0). */
export function centsToInput(cents: number): string {
  if (!cents) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

/** Formata centavos como moeda BRL: `1990` → `"R$ 19,90"`. */
export function formatBRL(cents: number): string {
  const value = (Number.isFinite(cents) ? cents : 0) / 100;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

/**
 * Converte texto digitado em centavos inteiros.
 * Aceita `"19,90"`, `"1.234,56"` (padrão BR) e `"19.90"` (ponto decimal).
 * Retorna `0` para entradas inválidas ou negativas.
 */
export function parseBRLToCents(input: string): number {
  const s = String(input ?? "").trim();
  if (!s) return 0;
  // O sinal precisa ser barrado ANTES da limpeza: o filtro lá embaixo remove
  // tudo que não é dígito ou ponto — inclusive o "-" — então a checagem
  // `value < 0` nunca dispararia e "-10,00" viraria 1000 silenciosamente.
  if (s.startsWith("-")) return 0;
  // Com vírgula → BR: ponto é milhar, vírgula é decimal. Sem vírgula → ponto é decimal.
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const cleaned = normalized.replace(/[^\d.]/g, "");
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}
