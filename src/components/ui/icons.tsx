import type { SVGProps } from "react";

/**
 * Ícones do app — fonte única.
 *
 * Todo ícone nasce do mesmo `Svg` base, então traço, caps e viewBox ficam
 * automaticamente em sincronia: mudar a espessura padrão aqui muda no app
 * inteiro. Não redesenhe um SVG inline num componente — adicione aqui e
 * importe, senão o padrão volta a divergir arquivo a arquivo.
 */
export type IconComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const EstoqueIcon: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="4" rx="1" />
    <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
    <path d="M10 12h4" />
  </Svg>
);

export const CentralIcon: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="3" y="3" width="8" height="8" rx="1" />
    <rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </Svg>
);

export const MateriaPrimaIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M21 8L12 3 3 8v8l9 5 9-5V8z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </Svg>
);

export const ProdutosIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M20.59 13.41L13 21l-9-9V4h8l8.59 8.41a2 2 0 0 1 0 2.83z" />
    <circle cx="7.5" cy="7.5" r="1.25" />
  </Svg>
);

export const MovimentacoesIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M7 17V7M7 7l-3 3M7 7l3 3" />
    <path d="M17 7v10M17 17l-3-3M17 17l3-3" />
  </Svg>
);

export const VendasIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M3 3h2l2.4 12.5a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
    <circle cx="9" cy="20" r="1" />
    <circle cx="18" cy="20" r="1" />
  </Svg>
);

export const NovaVendaIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M12 12v6M9 15h6" />
  </Svg>
);

export const ChevronIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);

export const CollapseIcon: IconComponent = (props) => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
    <path d="M13.5 10l2 2-2 2" />
  </Svg>
);

export const MenuIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const CloseIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const SearchIcon: IconComponent = (props) => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </Svg>
);

export const PlusIcon: IconComponent = (props) => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);
