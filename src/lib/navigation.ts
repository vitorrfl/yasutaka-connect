import {
  CentralIcon,
  EstoqueIcon,
  MateriaPrimaIcon,
  MovimentacoesIcon,
  NovaVendaIcon,
  ProdutosIcon,
  VendasIcon,
  type IconComponent,
} from "@/components/ui/icons";

/**
 * Navegação do app — fonte única.
 *
 * A `Sidebar` (desktop) e a `TabBar` (mobile) leem daqui. Rota nova ou rota
 * renomeada se resolve neste arquivo e as duas acompanham juntas; não declare
 * itens de menu dentro de componente, senão as duas navegações divergem.
 */

export interface NavItem {
  href: string;
  label: string;
  icon: IconComponent;
}

export interface NavGroup {
  label: string;
  icon: IconComponent;
  items: NavItem[];
}

/** Árvore completa — usada pela sidebar e pelo drawer. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Vendas",
    icon: VendasIcon,
    items: [
      { href: "/vendas", label: "Menu de Vendas", icon: CentralIcon },
      { href: "/vendas/nova", label: "Nova venda", icon: NovaVendaIcon },
    ],
  },
  {
    label: "Estoque",
    icon: EstoqueIcon,
    items: [
      { href: "/estoque", label: "Central de Estoque", icon: CentralIcon },
      { href: "/estoque/produtos", label: "Produtos", icon: ProdutosIcon },
      { href: "/estoque/materia-prima", label: "Matéria Prima", icon: MateriaPrimaIcon },
      { href: "/estoque/movimentacoes", label: "Movimentações", icon: MovimentacoesIcon },
    ],
  },
];

/**
 * Destinos da tab bar mobile — 5, o teto que a HIG da Apple recomenda.
 *
 * Rótulos propositalmente mais curtos que os da sidebar: num iPhone 8 (375px)
 * sobram ~59px por aba depois de descontar o acessório e os espaçamentos, e
 * "Matéria Prima" ou "Movimentações" seriam truncados no meio. A tab bar tem
 * sua própria lista justamente pra poder encurtar sem mexer no menu completo.
 */
export const TAB_ITEMS: NavItem[] = [
  { href: "/vendas", label: "Vendas", icon: VendasIcon },
  { href: "/estoque", label: "Estoque", icon: EstoqueIcon },
  { href: "/estoque/produtos", label: "Produtos", icon: ProdutosIcon },
  { href: "/estoque/materia-prima", label: "Matéria", icon: MateriaPrimaIcon },
  { href: "/estoque/movimentacoes", label: "Movim.", icon: MovimentacoesIcon },
];

/**
 * Botão solto à direita da tab bar (padrão iOS 26: o acessório se destaca do
 * grupo pra sinalizar "isto é a ação principal"). Aqui é abrir uma venda.
 */
export const TAB_ACCESSORY: NavItem = {
  href: "/vendas/nova",
  label: "Nova venda",
  icon: NovaVendaIcon,
};

/**
 * Qual href da lista casa com a rota atual — o mais específico vence.
 *
 * Sem a regra de especificidade, `/estoque` marcaria como ativo também em
 * `/estoque/produtos`, acendendo duas abas ao mesmo tempo.
 */
export function activeHref(pathname: string, hrefs: string[]): string | null {
  const matches = hrefs.filter((href) => pathname === href || pathname.startsWith(`${href}/`));
  if (matches.length === 0) return null;
  return matches.reduce((best, href) => (href.length > best.length ? href : best));
}

export function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
