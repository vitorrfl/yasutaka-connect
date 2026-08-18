import { notFound } from "next/navigation";
import { saleService } from "@/lib/container";
import { NotaClient } from "./NotaClient";

export const dynamic = "force-dynamic";

export default async function NotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await saleService.getSale(id);
  if (!sale) notFound();

  return <NotaClient sale={sale.toJSON()} />;
}
