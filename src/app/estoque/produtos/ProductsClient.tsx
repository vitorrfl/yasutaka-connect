"use client";

import { useMemo, useState, useTransition, type SVGProps } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";
import type { ProductJSON } from "@/domain/entities/Product";
import type { CategoryJSON } from "@/domain/entities/Category";
import { UNIT_OPTIONS } from "@/lib/units";
import {
  createCategoryAction,
  deleteCategoryAction,
  createProductAction,
  addVariantAction,
  adjustVariantQuantityAction,
  removeVariantAction,
  deleteProductAction,
} from "./actions";

interface ProductsClientProps {
  products: ProductJSON[];
  categories: CategoryJSON[];
}

/** Sugestões pro campo "varia por" — o usuário pode digitar qualquer outra. */
const VARIATION_LABEL_SUGGESTIONS = ["Cor", "Medida", "Modelo", "Tamanho", "Material"];

/** Valor do <Select> para "Sem categoria" — string vazia vira null na server action. */
const NO_CATEGORY = "";

function quantityVariant(quantity: number): "danger" | "warning" | "success" {
  if (quantity === 0) return "danger";
  if (quantity < 5) return "warning";
  return "success";
}

function ChevronIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function ProductCard({
  product,
  onManage,
  onDelete,
}: {
  product: ProductJSON;
  onManage: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const itemCount = product.variants.length;
  const variesBy = product.variationLabel;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-white transition-shadow",
        open ? "border-slate-300 shadow-sm" : "border-slate-200 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-slate-50"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-slate-900">{product.name}</div>
          <div className="text-xs text-slate-500">
            {product.unit}
            {variesBy && <> · varia por {variesBy}</>} · {itemCount} {itemCount === 1 ? "item" : "itens"}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-base font-semibold leading-none text-slate-900">{product.totalQuantity}</div>
          <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">total</div>
        </div>
        <ChevronIcon
          width={18}
          height={18}
          className={cn("shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-90")}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 border-t border-slate-200 p-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {variesBy ?? "Itens"}
              </span>
              {itemCount > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {product.variants.map((v) => (
                    <Badge key={v.id} variant={quantityVariant(v.quantity)}>
                      {v.name}: {v.quantity}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-slate-400">Nenhum item cadastrado</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1" onClick={onManage}>
                Gerenciar
              </Button>
              <Button size="sm" variant="danger" className="flex-1" onClick={onDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  title,
  count,
  onAddProduct,
  onDeleteCategory,
  children,
}: {
  title: string;
  count: number;
  onAddProduct: () => void;
  onDeleteCategory?: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/60">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <ChevronIcon
            width={16}
            height={16}
            className={cn("shrink-0 text-slate-400 transition-transform duration-200", open && "rotate-90")}
          />
          <span className="truncate text-sm font-semibold uppercase tracking-wide text-slate-700">{title}</span>
          <span className="shrink-0 text-xs font-normal text-slate-400">
            {count} {count === 1 ? "produto" : "produtos"}
          </span>
        </button>
        {onDeleteCategory && (
          <Button size="sm" variant="ghost" className="shrink-0 text-slate-400 hover:text-red-600" onClick={onDeleteCategory}>
            Excluir
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3 p-3 pt-0 sm:p-4 sm:pt-0">
            {children}
            <Button variant="ghost" size="sm" className="self-start" onClick={onAddProduct}>
              + Novo produto
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProductsClient({ products, categories }: ProductsClientProps) {
  const [isNewCategoryOpen, setNewCategoryOpen] = useState(false);
  const [isNewProductOpen, setNewProductOpen] = useState(false);
  const [newProductCategoryId, setNewProductCategoryId] = useState<string>(NO_CATEGORY);
  const [isCategoryLocked, setCategoryLocked] = useState(false);
  const [variationLabel, setVariationLabel] = useState("");
  const [variantRowCount, setVariantRowCount] = useState(1);
  const [managingProductId, setManagingProductId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { confirm, dialog: confirmDialog } = useConfirm();

  const managingProduct = products.find((p) => p.id === managingProductId) ?? null;

  // Agrupa produtos por categoria; órfãos (sem categoria ou categoria removida) vão pro bucket final.
  const { byCategory, orphans } = useMemo(() => {
    const known = new Set(categories.map((c) => c.id));
    const byCategory = new Map<string, ProductJSON[]>();
    const orphans: ProductJSON[] = [];
    for (const p of products) {
      if (p.categoryId && known.has(p.categoryId)) {
        const list = byCategory.get(p.categoryId) ?? [];
        list.push(p);
        byCategory.set(p.categoryId, list);
      } else {
        orphans.push(p);
      }
    }
    return { byCategory, orphans };
  }, [products, categories]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [categories]
  );

  // locked = veio do botão de uma categoria específica → categoria fixa.
  // solto = veio do botão do topo → usuário escolhe (com busca).
  function openNewProduct(categoryId: string, locked: boolean) {
    setNewProductCategoryId(categoryId);
    setCategoryLocked(locked);
    setVariationLabel("");
    setVariantRowCount(1);
    setNewProductOpen(true);
  }

  function closeNewProductModal() {
    setNewProductOpen(false);
    setVariationLabel("");
    setVariantRowCount(1);
  }

  function deleteCategory(category: CategoryJSON) {
    const affected = byCategory.get(category.id)?.length ?? 0;
    startTransition(async () => {
      const ok = await confirm({
        title: "Excluir categoria",
        description: (
          <>
            Excluir a categoria <strong>{category.name}</strong>?
            {affected > 0 ? (
              <> Os {affected} {affected === 1 ? "produto" : "produtos"} dela não serão apagados — vão para <strong>Sem categoria</strong> até você reorganizar.</>
            ) : (
              <> Essa ação não pode ser desfeita.</>
            )}
          </>
        ),
      });
      if (!ok) return;
      const fd = new FormData();
      fd.set("categoryId", category.id);
      startTransition(() => deleteCategoryAction(fd));
    });
  }

  async function deleteProduct(product: ProductJSON) {
    const ok = await confirm({
      title: "Excluir produto",
      description: (
        <>
          Tem certeza que deseja excluir <strong>{product.name}</strong>
          {product.variants.length > 0 && (
            <> e seus {product.variants.length} {product.variants.length === 1 ? "item" : "itens"}</>
          )}
          ? Essa ação não pode ser desfeita.
        </>
      ),
    });
    if (!ok) return;
    const fd = new FormData();
    fd.set("productId", product.id);
    startTransition(() => deleteProductAction(fd));
  }

  const hasNothing = products.length === 0 && categories.length === 0;

  function renderProducts(list: ProductJSON[]) {
    return list.map((p) => (
      <ProductCard
        key={p.id}
        product={p}
        onManage={() => setManagingProductId(p.id)}
        onDelete={() => deleteProduct(p)}
      />
    ));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 sm:justify-end">
        <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => setNewCategoryOpen(true)}>
          + Nova Categoria
        </Button>
        <Button className="flex-1 sm:flex-none" onClick={() => openNewProduct(sortedCategories[0]?.id ?? NO_CATEGORY, false)}>
          + Novo produto
        </Button>
      </div>

      {hasNothing ? (
        <p className="rounded-md border border-slate-200 py-8 text-center text-sm text-slate-500">
          Comece criando uma categoria (ex: Carimbos, Copos Stanley) e depois adicione produtos dentro dela.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedCategories.map((category) => {
            const list = byCategory.get(category.id) ?? [];
            return (
              <CategorySection
                key={category.id}
                title={category.name}
                count={list.length}
                onAddProduct={() => openNewProduct(category.id, true)}
                onDeleteCategory={() => deleteCategory(category)}
              >
                {list.length > 0 ? (
                  renderProducts(list)
                ) : (
                  <p className="py-2 text-center text-sm text-slate-400">Nenhum produto nesta categoria ainda</p>
                )}
              </CategorySection>
            );
          })}

          {orphans.length > 0 && (
            <CategorySection
              title="Sem categoria"
              count={orphans.length}
              onAddProduct={() => openNewProduct(NO_CATEGORY, true)}
            >
              {renderProducts(orphans)}
            </CategorySection>
          )}
        </div>
      )}

      {/* Nova categoria */}
      <Modal isOpen={isNewCategoryOpen} onClose={() => setNewCategoryOpen(false)} title="Nova Categoria">
        <form
          action={(fd) => {
            startTransition(async () => {
              await createCategoryAction(fd);
              setNewCategoryOpen(false);
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Nome da categoria" htmlFor="categoryName">
            <Input id="categoryName" name="name" placeholder="Ex: Carimbos, Copos Stanley…" required autoFocus />
          </FormField>
          <Button type="submit" isLoading={isPending}>
            Salvar categoria
          </Button>
        </form>
      </Modal>

      {/* Novo produto */}
      <Modal isOpen={isNewProductOpen} onClose={closeNewProductModal} title="Novo produto">
        <form
          action={(fd) => {
            startTransition(async () => {
              await createProductAction(fd);
              closeNewProductModal();
            });
          }}
          className="flex flex-col gap-4"
        >
          <FormField label="Categoria" htmlFor="productCategory">
            {isCategoryLocked ? (
              <div className="flex h-10 w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600">
                <LockIcon width={15} height={15} className="shrink-0 text-slate-400" />
                <span className="truncate font-medium text-slate-700">
                  {sortedCategories.find((c) => c.id === newProductCategoryId)?.name ?? "Sem categoria"}
                </span>
                <input type="hidden" name="categoryId" value={newProductCategoryId} />
              </div>
            ) : (
              <SearchableSelect
                id="productCategory"
                name="categoryId"
                value={newProductCategoryId}
                onChange={(value) => setNewProductCategoryId(value)}
                searchPlaceholder="Buscar categoria…"
                options={[
                  ...sortedCategories.map((c) => ({ label: c.name, value: c.id })),
                  { label: "Sem categoria", value: NO_CATEGORY },
                ]}
              />
            )}
          </FormField>
          <FormField label="Nome do produto" htmlFor="productName">
            <Input id="productName" name="name" placeholder="Ex: Carimbo de madeira, Stanley 300ml…" required />
          </FormField>
          <FormField label="Unidade" htmlFor="productUnit" className="w-32">
            <Select id="productUnit" name="unit" defaultValue="un" options={UNIT_OPTIONS} />
          </FormField>
          <FormField label="Varia por" htmlFor="variationLabel">
            <Input
              id="variationLabel"
              name="variationLabel"
              value={variationLabel}
              onChange={(e) => setVariationLabel(e.target.value)}
              placeholder="Ex: Cor, Medida, Modelo…"
            />
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {VARIATION_LABEL_SUGGESTIONS.map((s) => {
                const active = variationLabel.trim().toLowerCase() === s.toLowerCase();
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setVariationLabel(active ? "" : s)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      active
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </FormField>

          <div className="flex flex-col gap-2">
            <div>
              <span className="text-sm font-medium text-slate-700">Variações</span>
              <p className="text-xs text-slate-500">Cada variação com sua quantidade atual em estoque.</p>
            </div>
            {variantRowCount > 0 && (
              <div className="flex gap-2 px-0.5 text-xs font-medium text-slate-400">
                <span className="flex-1">Variação</span>
                <span className="w-20 shrink-0">Qtd.</span>
              </div>
            )}
            {Array.from({ length: variantRowCount }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input name="variantName" placeholder="Ex: 5x7, Preto, Printer 10…" className="flex-1" />
                <Input
                  name="variantQuantity"
                  type="number"
                  min={0}
                  defaultValue={0}
                  aria-label="Quantidade"
                  className="w-20 shrink-0"
                />
              </div>
            ))}
            <Button type="button" variant="ghost" size="sm" onClick={() => setVariantRowCount((n) => n + 1)}>
              + Adicionar variação
            </Button>
          </div>

          <Button type="submit" isLoading={isPending}>
            Salvar produto
          </Button>
        </form>
      </Modal>

      {/* Gerenciar produto */}
      <Modal
        isOpen={!!managingProduct}
        onClose={() => setManagingProductId(null)}
        title={managingProduct ? `Variações de ${managingProduct.name}` : undefined}
      >
        {managingProduct && (
          <div className="flex flex-col gap-4">
            {managingProduct.variationLabel && (
              <p className="text-xs text-slate-500">
                Varia por <span className="font-medium text-slate-700">{managingProduct.variationLabel}</span>
              </p>
            )}
            {managingProduct.variants.map((v) => (
              <form
                key={v.id}
                action={(fd) => {
                  fd.set("productId", managingProduct.id);
                  fd.set("variantId", v.id);
                  startTransition(() => adjustVariantQuantityAction(fd));
                }}
                className="flex flex-wrap items-center gap-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">{v.name}</span>
                <Input name="quantity" type="number" min={0} defaultValue={v.quantity} className="w-20 sm:w-24" />
                <Button size="sm" type="submit" isLoading={isPending}>
                  Salvar
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  onClick={async () => {
                    // Remover a última variação = ficar sem estoque nenhum → excluir o produto inteiro.
                    const isLast = managingProduct.variants.length === 1;
                    const ok = await confirm(
                      isLast
                        ? {
                            title: "Excluir produto",
                            description: (
                              <>
                                <strong>{v.name}</strong> é a única variação de {managingProduct.name}. Removê-la
                                exclui o produto inteiro. Deseja continuar?
                              </>
                            ),
                            confirmLabel: "Excluir produto",
                          }
                        : {
                            title: "Remover variação",
                            description: (
                              <>
                                Remover <strong>{v.name}</strong> de {managingProduct.name}? Essa ação não pode ser desfeita.
                              </>
                            ),
                            confirmLabel: "Remover",
                          }
                    );
                    if (!ok) return;
                    const fd = new FormData();
                    fd.set("productId", managingProduct.id);
                    if (isLast) {
                      setManagingProductId(null);
                      startTransition(() => deleteProductAction(fd));
                      return;
                    }
                    fd.set("variantId", v.id);
                    startTransition(() => removeVariantAction(fd));
                  }}
                >
                  Remover
                </Button>
              </form>
            ))}

            <form
              action={(fd) => {
                fd.set("productId", managingProduct.id);
                startTransition(() => addVariantAction(fd));
              }}
              className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-end"
            >
              <FormField label={`Nova variação${managingProduct.variationLabel ? ` (${managingProduct.variationLabel})` : ""}`} htmlFor="newVariantName">
                <Input id="newVariantName" name="name" placeholder="Ex: 10x10, Azul, Printer 20…" required />
              </FormField>
              <FormField label="Quantidade" htmlFor="newVariantQty">
                <Input id="newVariantQty" name="quantity" type="number" min={0} defaultValue={0} className="sm:w-24" />
              </FormField>
              <Button type="submit" isLoading={isPending}>
                Adicionar
              </Button>
            </form>
          </div>
        )}
      </Modal>

      {confirmDialog}
    </div>
  );
}
