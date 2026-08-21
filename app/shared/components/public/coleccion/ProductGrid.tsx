import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/app/shared/types/product.types";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import { ROUTES } from "@/app/shared/routes/routes";

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export default function ProductGrid({
  products,
  currentPage,
  totalPages,
}: ProductGridProps) {
  return (
    <div className=" w-full ">
      <div className="flex flex-col gap-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-4">
            {products.map((product) => {
              const option = product.product_options?.[0];

              if (!option) {
                return null;
              }

              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  imageSrc={getProductImages(product)[0]?.secure_url ?? null}
                  nombre={product.nombre}
                  precio={option.precio}
                />
              );
            })}
          </div>
        ) : (
          <p className="font-dm-sans text-neutral-700">
            No hay productos disponibles.
          </p>
        )}

        {totalPages > 1 && (
          <nav
            aria-label="Paginación del catálogo"
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {currentPage > 1 ? (
              <Link
                href={ROUTES.COLECCION_PAGE(currentPage - 1)}
                className="rounded-full border border-hard-brown px-5 py-2 font-dm-sans text-hard-brown transition-colors hover:bg-hard-brown hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hard-brown"
              >
                Anterior
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-full border border-neutral-300 px-5 py-2 font-dm-sans text-neutral-400"
              >
                Anterior
              </span>
            )}

            <span className="font-dm-sans text-sm text-hard-brown sm:text-base">
              Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={ROUTES.COLECCION_PAGE(currentPage + 1)}
                className="rounded-full bg-hard-brown px-5 py-2 font-dm-sans text-white transition-colors hover:bg-hard-brown/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hard-brown"
              >
                Siguiente
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="cursor-not-allowed rounded-full bg-neutral-300 px-5 py-2 font-dm-sans text-neutral-500"
              >
                Siguiente
              </span>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
