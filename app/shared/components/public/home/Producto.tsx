import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import { ROUTES } from "@/app/shared/routes/routes";

interface ProductProps {
  title: string;
  description: string;
  imageSrc: string | null;
  price: number;
  slug: string;
  index?: number;
}

export default function ProductCard({
  title,
  description,
  imageSrc,
  price,
  slug,
  index = 0,
}: ProductProps) {
  const num = String(index + 1).padStart(2, "0");
  const reversed = index % 2 === 1;

  return (
    <li className="list-none">
      <article className="grid grid-cols-1 items-center gap-8 border-t border-hard-brown/60 py-10 md:grid-cols-12 lg:gap-12 lg:py-14">
        {/* Imagen — ficha con aspecto reservado, sin CLS */}
        <div className={reversed ? "md:order-2 md:col-span-7" : "md:col-span-7"}>
          <Link
            href={ROUTES.PRODUCT(slug)}
            aria-label={`Ver detalles de ${title}`}
            className="group block overflow-hidden rounded-[2px] border border-hard-brown/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
          >
            <div className="relative aspect-[4/3] w-full md:aspect-[16/11]">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={`Vela ${title}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 58vw"
                  className="object-cover object-center sepia-[0.14] contrast-[1.03] saturate-[0.9] transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div
                  role="img"
                  aria-label={`Imagen no disponible para ${title}`}
                  className="flex h-full items-center justify-center bg-hard-brown/5 font-dm-sans text-xs uppercase tracking-[0.2em] text-hard-brown/50"
                >
                  Imagen no disponible
                </div>
              )}
            </div>
          </Link>
          <p className="mt-3 flex items-center justify-between font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-hard-brown/70">
            <span>
              N.º {num} · Edición 2026
            </span>
            <span className="hidden sm:inline">Vertido a mano</span>
          </p>
        </div>

        {/* Ficha editorial */}
        <div
          className={
            reversed
              ? "md:order-1 md:col-span-5"
              : "md:col-span-5"
          }
        >
          <span
            aria-hidden="true"
            className="font-mileast text-5xl leading-none tracking-[-0.04em] text-hard-brown/30 lg:text-6xl"
          >
            {num}
          </span>

          <h3 className="mt-3 font-mileast text-3xl leading-[1.02] tracking-[-0.03em] text-balance lg:text-5xl">
            {title}
          </h3>

          <p className="mt-4 line-clamp-3 max-w-md font-dm-sans text-sm leading-6 text-[#433227] lg:text-base lg:leading-7">
            {description}
          </p>

          <p className="mt-5 font-dm-sans text-sm uppercase tracking-[0.18em] text-hard-brown">
            S/{price}
          </p>

          <Link
            href={ROUTES.PRODUCT(slug)}
            className="group mt-4 inline-flex min-h-11 items-center gap-3 border-b border-hard-brown pb-1 font-dm-sans text-xs uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
            aria-label={`Ver detalles de ${title}`}
          >
            Ver pieza
            <MoveRight
              aria-hidden="true"
              className="size-4 transition-transform duration-200 group-hover:translate-x-1"
            />
          </Link>
        </div>
      </article>
    </li>
  );
}
