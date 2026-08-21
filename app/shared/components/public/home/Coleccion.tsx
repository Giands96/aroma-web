import { getProductImages } from "@/app/shared/lib/utils/product-images";
import {
  getFeaturedProducts,
  getThreeLastProducts,
} from "@/app/shared/services/products.service";
import { MoveRight } from "lucide-react";
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
    <section className="flex flex-col p-6 py-24 md:py-12 md:py-24 gap-3 bg-[#F4EDE9]">
      <header className="flex flex-col md:flex-row border-b border-hard-brown justify-normal md:gap-0 text-center md:text-left md:justify-between items-center w-full gap-4">
        <h2 className="text-6xl md:text-8xl text-hard-brown">Colección</h2>
        <p className="font-dm-sans text-base xl:text-lg md:text-2xl lg:text-xl text-hard-brown">
          Piezas artesanales creadas para acompañarte en tus mejores momentos
        </p>
      </header>
      <div className="flex min-w-full justify-center md:justify-normal">
        <Link
          className="font-dm-sans text-xl flex gap-2 text-hard-brown border-b border-hard-brown"
          href={ROUTES.COLECCION}
        >
          Ver colección <MoveRight />
        </Link>
      </div>
      <div className="flex flex-col">
        {productCards.map((product) => (
          <ProductCard key={product.slug} {...product} />
        ))}
      </div>
    </section>
  );
}
