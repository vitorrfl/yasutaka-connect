import Link from "next/link";
import type { SVGProps } from "react";

function NovaVendaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 12v6M9 15h6" />
    </svg>
  );
}
function OrcamentoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" />
    </svg>
  );
}
function HistoricoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function RelatorioIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18" />
      <rect x="7" y="12" width="3" height="6" />
      <rect x="12" y="8" width="3" height="10" />
      <rect x="17" y="5" width="3" height="13" />
    </svg>
  );
}
function CancelarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}

interface VendaAction {
  href?: string;
  label: string;
  desc: string;
  icon: (props: SVGProps<SVGSVGElement>) => React.JSX.Element;
  soon?: boolean;
}

const ACTIONS: VendaAction[] = [
  { href: "/vendas/nova", label: "Nova venda", desc: "Montar um novo pedido de venda", icon: NovaVendaIcon },
  { href: "/vendas/nova?tipo=orcamento", label: "Novo orçamento", desc: "Gerar um orçamento — não baixa estoque", icon: OrcamentoIcon },
  { label: "Histórico de vendas", desc: "Consultar e reimprimir notinhas", icon: HistoricoIcon, soon: true },
  { label: "Relatório de vendas", desc: "Totais por período", icon: RelatorioIcon, soon: true },
  { label: "Cancelar venda", desc: "Estornar uma venda e devolver o estoque", icon: CancelarIcon, soon: true },
];

export default function VendasPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-slate-900 sm:text-2xl">Vendas</h1>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          if (a.soon || !a.href) {
            return (
              <div key={a.label} className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-4 opacity-60">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-400">
                  <Icon width={22} height={22} />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-700">{a.label}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      em breve
                    </span>
                  </div>
                  <div className="text-sm text-slate-400">{a.desc}</div>
                </div>
              </div>
            );
          }
          return (
            <Link
              key={a.label}
              href={a.href}
              className="group flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors group-hover:bg-blue-600">
                <Icon width={22} height={22} />
              </span>
              <div className="min-w-0">
                <div className="font-medium text-slate-900">{a.label}</div>
                <div className="text-sm text-slate-500">{a.desc}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
