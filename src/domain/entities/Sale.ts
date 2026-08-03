import { Entity } from "./Entity";
import { SaleItem, type SaleItemJSON } from "./SaleItem";

export enum SaleType {
  VENDA = "VENDA",
  ORCAMENTO = "ORCAMENTO",
}

export interface SaleProps {
  /** Número sequencial do pedido (o "Nº do Pedido"). */
  number: number;
  /** Código curto e legível (data+hora), redundante ao número mas único. */
  code: string;
  /** Venda (baixa estoque) ou Orçamento (não baixa). */
  type: SaleType;
  items: SaleItem[];
  /** Nome do comprador. Padrão "Cliente Diversos" quando não informado. */
  customerName?: string;
  /** Atendente/vendedor que montou o pedido. */
  sellerName?: string;
  /** Frete em centavos. */
  freight: number;
  note?: string;
  createdAt: Date;
}

export type SaleJSON = {
  id: string;
  number: number;
  code: string;
  type: SaleType;
  items: SaleItemJSON[];
  customerName: string | null;
  sellerName: string | null;
  freight: number;
  note: string | null;
  /** Soma dos brutos dos itens (VALOR DOS ITENS). */
  grossItems: number;
  /** Soma dos descontos dos itens. */
  discountTotal: number;
  /** grossItems − discountTotal + freight. */
  total: number;
  itemCount: number;
  createdAt: string;
};

/** Gera um código legível a partir da data: `2407-143512` (ddMM-HHmmss). */
function generateSaleCode(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}${p(d.getMonth() + 1)}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/**
 * Uma venda / "notinha": conjunto de itens que o cliente leva impresso para o caixa.
 * Não guarda forma de pagamento — o pagamento acontece no caixa, fora daqui.
 * Pode ser um Orçamento (não baixa estoque) em vez de uma Venda.
 */
export class Sale extends Entity<SaleProps> {
  private constructor(props: SaleProps, id: string) {
    super(props, id);
  }

  static create(
    input: {
      number: number;
      type?: SaleType;
      items: {
        productId: string;
        variantId: string;
        productName: string;
        variantName: string;
        unit?: string;
        unitPrice: number;
        quantity: number;
        discount?: number;
      }[];
      customerName?: string;
      sellerName?: string;
      freight?: number;
      note?: string;
    },
    id?: string
  ): Sale {
    if (!input.items?.length) {
      throw new Error("A venda precisa de ao menos um item");
    }
    const now = new Date();
    const items = input.items.map((i) => SaleItem.create(i));
    return new Sale(
      {
        number: input.number,
        code: generateSaleCode(now),
        type: input.type ?? SaleType.VENDA,
        items,
        customerName: input.customerName?.trim() || undefined,
        sellerName: input.sellerName?.trim() || undefined,
        freight: Math.max(0, Math.round(input.freight ?? 0)),
        note: input.note?.trim() || undefined,
        createdAt: now,
      },
      id ?? crypto.randomUUID()
    );
  }

  static reconstruct(props: SaleProps, id: string): Sale {
    return new Sale(props, id);
  }

  get number(): number {
    return this.props.number;
  }

  get code(): string {
    return this.props.code;
  }

  get type(): SaleType {
    return this.props.type;
  }

  get isQuote(): boolean {
    return this.props.type === SaleType.ORCAMENTO;
  }

  get items(): readonly SaleItem[] {
    return this.props.items;
  }

  get customerName(): string | undefined {
    return this.props.customerName;
  }

  get sellerName(): string | undefined {
    return this.props.sellerName;
  }

  get freight(): number {
    return this.props.freight;
  }

  get note(): string | undefined {
    return this.props.note;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  /** Soma dos brutos dos itens (VALOR DOS ITENS), em centavos. */
  get grossItems(): number {
    return this.props.items.reduce((sum, i) => sum + i.grossTotal, 0);
  }

  /** Soma dos descontos dos itens, em centavos. */
  get discountTotal(): number {
    return this.props.items.reduce((sum, i) => sum + i.discount, 0);
  }

  /** Total da venda: bruto − desconto + frete, em centavos. */
  get total(): number {
    return this.grossItems - this.discountTotal + this.props.freight;
  }

  /** Soma das quantidades de todos os itens. */
  get itemCount(): number {
    return this.props.items.reduce((sum, i) => sum + i.quantity, 0);
  }

  toJSON(): SaleJSON {
    return {
      id: this.id,
      number: this.props.number,
      code: this.props.code,
      type: this.props.type,
      items: this.props.items.map((i) => i.toJSON()),
      customerName: this.props.customerName ?? null,
      sellerName: this.props.sellerName ?? null,
      freight: this.props.freight,
      note: this.props.note ?? null,
      grossItems: this.grossItems,
      discountTotal: this.discountTotal,
      total: this.total,
      itemCount: this.itemCount,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
