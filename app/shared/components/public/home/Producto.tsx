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
}

export default function ProductCard({
  title,
  description,
  imageSrc,
  price,
  slug,
}: ProductProps) {
  

  return (
    <article className="flex flex-col items-center justify-between gap-0 md:gap-6 border-t border-hard-brown md:flex-row ">
      <div className="relative h-100 w-full overflow-hidden md:w-1/2">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Vela ${title}`}
            fill
            sizes="(max-width: 767px) 100vw, 50vw"
            className="object-cover object-center"
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

      <div className="flex w-full flex-col gap-3 p-6 md:w-1/2 md:gap-6 border-b border-l border-r md:border-0 border-hard-brown">
        <h2 className="text-4xl text-hard-brown">{title}</h2>

        <div className="mt-3 flex flex-col gap-6">
          <p className="font-dm-sans text-xl text-hard-brown">{description}</p>

          <p className="text-xl font-bold text-hard-brown">S/{price}</p>

          <Link
            href={ROUTES.LEGACY_PRODUCT(slug)}
            className="flex w-fit items-center gap-4 border-b border-hard-brown font-dm-sans text-xl text-hard-brown hover:gap-6 transition-transform duration-300"
            aria-label={`Ver detalles de ${title}`}
          >
            Ver detalles
            <MoveRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
