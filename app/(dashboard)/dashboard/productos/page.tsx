import Link from "next/link";
import { Plus } from "lucide-react";
import { getAllProducts } from "@/app/shared/services/products.service";
import ProductList from "../_components/ProductList";
import { ROUTES } from "@/app/shared/routes/routes";

export default async function DashboardProductosPage() {
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-dm-sans text-sm font-medium text-zinc-500">Catálogo</p>
          <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">Productos</h1>
        </div>
        <Link
          href={ROUTES.DASHBOARD.NEW_PRODUCT}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto sm:min-h-12"
        >
          <Plus aria-hidden="true" className="size-4" />
          Nuevo
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-10 text-center shadow-sm">
          <p className="font-dm-sans text-sm text-zinc-500">
            No hay productos todavía.
          </p>
          <Link
            href={ROUTES.DASHBOARD.NEW_PRODUCT}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-zinc-200 px-4 font-dm-sans text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <Plus aria-hidden="true" className="size-4" />
            Crear el primero
          </Link>
        </div>
      ) : (
        <ProductList products={products} />
      )}
    </div>
  );
}
