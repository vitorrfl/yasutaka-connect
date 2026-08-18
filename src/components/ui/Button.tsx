import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Botão do app — fonte única (ver AGENTS.md).
 *
 * Duas camadas, seguindo a regra da própria Apple para o iOS 26:
 *
 * - CONTEÚDO  → variantes sólidas (`primary`/`secondary`/`danger`/`ghost`).
 *   É o botão de formulário, de tabela, de modal. `primary` segue slate-900
 *   em repouso acendendo pra blue-600 na interação — a identidade da marca.
 *
 * - FLUTUANTE → variantes de vidro (`glass`/`glassTinted`), só para o que
 *   PAIRA sobre o conteúdo: tab bar, toolbars, botão de ação flutuante.
 *
 * Não use vidro na camada de conteúdo: sobre tabela/formulário ele perde
 * contraste, que é a crítica de usabilidade mais consistente ao Liquid Glass.
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "glass" | "glassPrimary";
export type ButtonSize = "sm" | "md" | "tap" | "lg";
export type ButtonShape = "rounded" | "capsule" | "circle";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** `capsule`/`circle` são a geometria iOS 26. `circle` é para botão só-ícone. */
  shape?: ButtonShape;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-blue-600 active:bg-blue-600 focus-visible:ring-blue-500",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  // hover/active via Tailwind: a pseudo-classe tem especificidade maior que a
  // do .glass, então vence o background sem depender da ordem do arquivo.
  glass: "glass text-slate-900 hover:bg-white/80 active:scale-[0.96] focus-visible:ring-blue-500",
  glassPrimary: "glass glass-primary hover:bg-blue-600 active:bg-blue-600 active:scale-[0.96] focus-visible:ring-blue-500",
};

/** `tap` = 44px, piso de alvo de toque da HIG. Use nos botões flutuantes. */
const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
  tap: "h-11 text-sm",
  lg: "h-12 text-base",
};

/** Largura/padding dependem da forma: círculo é quadrado e sem padding. */
const SHAPE_SIZE_STYLES: Record<ButtonShape, Record<ButtonSize, string>> = {
  rounded: { sm: "px-3", md: "px-4", tap: "px-5", lg: "px-6" },
  capsule: { sm: "px-3.5", md: "px-5", tap: "px-5", lg: "px-6" },
  circle: { sm: "w-8 p-0", md: "w-10 p-0", tap: "w-11 p-0", lg: "w-12 p-0" },
};

const SHAPE_RADIUS: Record<ButtonShape, string> = {
  rounded: "rounded-md",
  capsule: "rounded-full",
  circle: "rounded-full",
};

function Spinner() {
  return (
    <svg className="animate-spin" width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

const BASE_STYLES =
  "inline-flex touch-manipulation items-center justify-center gap-2 font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50";

/**
 * As classes de um botão, sem o elemento.
 *
 * Existe para o que navega: um destino é `<Link>`, não `<button>`, mas precisa
 * ser idêntico a um botão. Use isto em vez de recopiar as classes na mão —
 * é o que mantém link e botão em sincronia quando o estilo mudar.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  shape = "rounded",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  className?: string;
} = {}) {
  return cn(
    BASE_STYLES,
    SHAPE_RADIUS[shape],
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    SHAPE_SIZE_STYLES[shape][size],
    className
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = "primary", size = "md", shape = "rounded", type = "button", isLoading, className, children, disabled, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        // Default explícito: sem isto o HTML assume `submit`, e qualquer botão
        // que caia dentro de um <form> envia o formulário sem querer.
        type={type}
        className={buttonClasses({ variant, size, shape, className })}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Círculo é só-ícone: "Carregando..." estouraria o layout, então gira spinner. */}
        {isLoading ? shape === "circle" ? <Spinner /> : "Carregando..." : children}
      </button>
    );
  }
);
Button.displayName = "Button";
