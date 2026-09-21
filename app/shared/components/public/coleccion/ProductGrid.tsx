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
    <div className="w-full pt-10 lg:pt-12">
      <div className="flex flex-col gap-12">
        {products.length > 0 ? (
          <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {products.map((product, i) => {
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
                  index={i}
                />
              );
            })}
          </ul>
        ) : (
          <p className="font-dm-sans text-sm leading-6 text-[#433227]">
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
                className="inline-flex min-h-11 items-center rounded-[2px] border border-hard-brown px-5 py-2 font-dm-sans text-xs uppercase tracking-[0.16em] text-hard-brown transition-colors duration-200 hover:bg-hard-brown hover:text-[#F4EDE9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hard-brown"
              >
                Anterior
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 cursor-not-allowed items-center rounded-[2px] border border-hard-brown/30 px-5 py-2 font-dm-sans text-xs uppercase tracking-[0.16em] text-hard-brown/40"
              >
                Anterior
              </span>
            )}

            <span className="font-dm-sans text-sm tabular-nums tracking-[0.08em] text-[#433227]">
              Página {currentPage} de {totalPages}
            </span>

            {currentPage < totalPages ? (
              <Link
                href={ROUTES.COLECCION_PAGE(currentPage + 1)}
                className="inline-flex min-h-11 items-center rounded-[2px] bg-hard-brown px-5 py-2 font-dm-sans text-xs uppercase tracking-[0.16em] text-[#F4EDE9] transition-colors duration-200 hover:bg-[#6d5540] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hard-brown"
              >
                Siguiente
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex min-h-11 cursor-not-allowed items-center rounded-[2px] bg-hard-brown/20 px-5 py-2 font-dm-sans text-xs uppercase tracking-[0.16em] text-hard-brown/40"
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
