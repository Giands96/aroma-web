"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  createFeaturedProductAction,
  deleteFeaturedProductAction,
} from "@/app/shared/actions/featured-products.actions";
import {
  MAX_FEATURED_PRODUCTS,
  MIN_FEATURED_PRODUCTS,
} from "@/app/shared/lib/featured-products";
import type { FeaturedProduct } from "@/app/shared/types/featured-product.types";

interface AvailableProduct {
  id: string;
  nombre: string;
}

interface FeaturedProductsManagerProps {
  featuredProducts: FeaturedProduct[];
  availableProducts: AvailableProduct[];
}

export default function FeaturedProductsManager({
  featuredProducts,
  availableProducts,
}: FeaturedProductsManagerProps) {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const canAdd =
    featuredProducts.length < MAX_FEATURED_PRODUCTS && availableProducts.length > 0;
  const canRemove = featuredProducts.length > MIN_FEATURED_PRODUCTS;

  const handleAdd = () => {
    if (!selectedProductId) return;

    setError(null);
    startTransition(async () => {
      const result = await createFeaturedProductAction({ productId: selectedProductId });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }

      setSelectedProductId("");
      router.refresh();
    });
  };

  const handleRemove = (id: number) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteFeaturedProductAction({ id });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-5">
      <section
        aria-labelledby="add-featured-product-heading"
        className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="add-featured-product-heading"
              className="font-dm-sans text-sm font-medium text-zinc-950"
            >
              Agregar producto destacado
            </h2>
            <p className="mt-1 font-dm-sans text-sm text-zinc-500">
              Selecciona hasta tres productos activos para la colección destacada.
            </p>
          </div>
          <span className="font-dm-sans text-sm font-medium text-zinc-600">
            {featuredProducts.length}/{MAX_FEATURED_PRODUCTS} seleccionados
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="featured-product">
            Producto activo
          </label>
          <select
            id="featured-product"
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(event.target.value)}
            disabled={!canAdd || isPending}
            className="min-h-11 flex-1 rounded-md border border-zinc-300 bg-white px-3 font-dm-sans text-sm text-zinc-950 outline-none transition-colors focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/15 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500"
          >
            <option value="">
              {availableProducts.length === 0
                ? "No hay productos activos disponibles"
                : "Elige un producto activo"}
            </option>
            {availableProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd || !selectedProductId || isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus aria-hidden="true" className="size-4" />
            {isPending ? "Guardando..." : "Agregar producto"}
          </button>
        </div>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-dm-sans text-sm text-red-700"
        >
          {error}
        </p>
      ) : null}

      <section aria-labelledby="featured-products-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="featured-products-heading"
            className="font-dm-sans text-sm font-medium text-zinc-950"
          >
            Selección actual
          </h2>
          <p className="font-dm-sans text-xs text-zinc-500">
            El orden coincide con la vista pública.
          </p>
        </div>

        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {featuredProducts.map((featuredProduct) => {
            const product = featuredProduct.products;

            return (
              <li
                key={featuredProduct.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-zinc-100 font-dm-sans text-sm font-semibold text-zinc-700">
                    {featuredProduct.posicion}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-dm-sans text-sm font-medium text-zinc-950">
                      {product?.nombre ?? "Producto no disponible"}
                    </h3>
                    <p className="mt-1 line-clamp-2 h-6 font-dm-sans text-xs leading-5 text-zinc-500">
                      {product?.descripcion ?? "Este producto ya no está disponible."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(featuredProduct.id)}
                  disabled={!canRemove || isPending}
                  aria-label={`Quitar ${product?.nombre ?? "producto destacado"}`}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 font-dm-sans text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:opacity-70"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  {canRemove ? "Quitar" : "Se requiere al menos un producto"}
                </button>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
