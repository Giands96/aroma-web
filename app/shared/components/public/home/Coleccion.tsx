import { getProductImages } from "@/app/shared/lib/utils/product-images";
import {
  getFeaturedProducts,
  getThreeLastProducts,
} from "@/app/shared/services/products.service";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ProductCard from "./Producto";
import { ROUTES } from "@/app/shared/routes/routes";

interface HomeProduct {
  slug: string;
  nombre: string;
  descripcion: string;
  imagen_public_id: string | null;
  imagen_url: string | null;
  imagenes?: unknown;
  product_options?: { precio: number }[];
}

function toHomeProductCard(product: HomeProduct) {
  const price = product.product_options?.[0]?.precio;

  if (price === undefined) return null;

  return {
    title: product.nombre,
    description: product.descripcion,
    imageSrc: getProductImages(product)[0]?.secure_url ?? null,
    price,
    slug: product.slug,
  };
}

function toHomeProductCards(products: HomeProduct[]) {
  return products
    .map(toHomeProductCard)
    .filter((product): product is NonNullable<typeof product> => product !== null);
}

export default async function ColeccionSection() {
  const featuredProducts = await getFeaturedProducts();
  const featuredProductCards = toHomeProductCards(
    featuredProducts.flatMap(({ products }) => (products ? [products] : [])),
  );
  const productCards = featuredProductCards.length > 0
    ? featuredProductCards
    : toHomeProductCards(await getThreeLastProducts());

  return (
    <section
      aria-labelledby="coleccion-title"
      className="w-full bg-[#F4EDE9] text-hard-brown"
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        {/* Encabezado unificado con el resto del Home */}
        <header className="grid grid-cols-1 gap-6 border-b border-hard-brown/60 py-12 md:grid-cols-12 md:items-end lg:py-16">
          <div className="md:col-span-7 lg:col-span-8">
            <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.24em] text-hard-brown/80">
              N.º 01 — Colección · Selección de la casa
            </p>
            <h2
              id="coleccion-title"
              className="mt-4 font-mileast text-[clamp(2.8rem,7vw,7.5rem)] font-normal uppercase leading-[0.85] tracking-[-0.05em]"
            >
              Colección
            </h2>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <p className="max-w-md font-dm-sans text-sm leading-6 text-[#433227] lg:text-base lg:leading-7">
              Piezas artesanales creadas para acompañarte en tus mejores
              momentos.
            </p>
            <Link
              href={ROUTES.COLECCION}
              className="group mt-6 inline-flex min-h-11 items-center gap-3 border-b border-hard-brown pb-1 font-dm-sans text-xs uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
            >
              Ver colección
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </header>

        {/* Fichas alternadas — lista semántica */}
        <ol>
          {productCards.map((product, i) => (
            <ProductCard key={product.slug} {...product} index={i} />
          ))}
        </ol>

        {/* Cierre — una sola acción, mismo idioma que Personalización */}
        <div className="pb-12 lg:pb-16">
          <Link
            href={ROUTES.COLECCION}
            className="group flex flex-col gap-6 rounded-[2px] bg-hard-brown p-6 text-[#F4EDE9] transition-colors duration-200 hover:bg-[#6d5540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10"
          >
            <div>
              <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em] text-[#F4EDE9]/75">
                Catálogo completo
              </p>
              <p className="mt-2 font-mileast text-3xl leading-none tracking-[-0.03em] lg:text-4xl">
                Explorar todas las piezas
              </p>
            </div>
            <span className="inline-flex min-h-11 w-fit items-center gap-3 rounded-[2px] bg-[#F4EDE9] px-5 py-3 font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-hard-brown transition-colors duration-200 group-hover:bg-white">
              Ver colección
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
