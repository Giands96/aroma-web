"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import type { Product } from "@/app/shared/types/product.types";
import { deleteProductAction } from "@/app/shared/actions/products.actions";
import { ROUTES } from "@/app/shared/routes/routes";

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left font-dm-sans text-xs font-medium text-zinc-500">
                Producto
              </th>
              <th className="px-4 py-3 text-left font-dm-sans text-xs font-medium text-zinc-500">
                Estado
              </th>
              <th className="px-4 py-3 text-left font-dm-sans text-xs font-medium text-zinc-500">
                Opciones
              </th>
              <th className="px-4 py-3 text-right font-dm-sans text-xs font-medium text-zinc-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-200 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <ProductThumbnail product={product} className="size-10" />
                    <div>
                      <p className="font-dm-sans text-sm font-medium text-zinc-950">
                        {product.nombre}
                      </p>
                      <p className="font-dm-sans text-xs text-zinc-500">
                        {product.slug}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-dm-sans text-[0.7rem] ${
                      product.activo
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                    <span className="font-dm-sans text-sm text-zinc-600">
                    {product.product_options?.length ?? 0}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={ROUTES.DASHBOARD.EDIT_PRODUCT(product.id)}
                      className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                      aria-label={`Editar ${product.nombre}`}
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                    </Link>
                    <DeleteButton productId={product.id} productName={product.nombre} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <ProductThumbnail product={product} className="size-14" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-dm-sans text-sm font-medium text-hard-brown">
                  {product.nombre}
                </p>
                <p className="truncate font-dm-sans text-xs text-hard-brown/50">
                  {product.slug}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 font-dm-sans text-[0.65rem] ${
                      product.activo
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.activo ? "Activo" : "Inactivo"}
                  </span>
                  <span className="font-dm-sans text-xs text-zinc-500">
                    {product.product_options?.length ?? 0} opciones
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Link
                  href={ROUTES.DASHBOARD.EDIT_PRODUCT(product.id)}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                  aria-label={`Editar ${product.nombre}`}
                >
                  <Pencil aria-hidden="true" className="size-4" />
                </Link>
                <DeleteButton productId={product.id} productName={product.nombre} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProductThumbnail({
  product,
  className,
}: {
  product: Product;
  className: string;
}) {
  const imageSrc = getProductImages(product)[0]?.secure_url;

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-md bg-zinc-100 ${className}`}>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={product.nombre}
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center font-dm-sans text-xs text-zinc-400">
          —
        </div>
      )}
    </div>
  );
}

function DeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteProductAction({ id: productId });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      router.refresh();
    });
  };

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Eliminar ${productName}`}
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
      {error && <p role="alert" className="absolute right-0 top-full z-10 mt-1 w-48 rounded-md border border-red-200 bg-red-50 p-2 font-dm-sans text-xs text-red-700">{error}</p>}
    </span>
  );
}
