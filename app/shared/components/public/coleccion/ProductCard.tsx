"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Reveal from "@/app/shared/components/ui/Reveal";
import { ROUTES } from "@/app/shared/routes/routes";

interface ProductCardProps {
  slug: string;
  imageSrc: string | null;
  nombre: string;
  precio: number;
  index?: number;
}

export default function ProductCard({
  slug,
  imageSrc,
  nombre,
  precio,
  index,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(() => Boolean(imageSrc));
  const [hasError, setHasError] = useState(false);

  const num = index !== undefined ? String(index + 1).padStart(2, "0") : null;

  return (
    <li className="list-none">
      <Reveal delay={((index ?? 0) % 3) * 0.08}>
      <Link
        href={ROUTES.PRODUCT(slug)}
        aria-label={`Ver detalles de ${nombre}`}
        className="group flex min-w-0 flex-col rounded-[2px] border border-hard-brown/60 bg-[#FAFAF9] transition-shadow duration-200 hover:shadow-[6px_6px_0_0_var(--color-hard-brown)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {isLoading && (
            <div
              aria-hidden="true"
              className="absolute inset-0 animate-pulse bg-[#EAD8C9]/60"
            />
          )}

          {imageSrc && !hasError ? (
            <Image
              className={`object-cover object-center sepia-[0.14] contrast-[1.03] saturate-[0.9] transition duration-300 group-hover:scale-[1.03] ${
                isLoading ? "opacity-0" : "opacity-100"
              }`}
              src={imageSrc}
              alt={nombre}
              fill
              sizes="
                (max-width: 639px) calc(100vw - 48px),
                (max-width: 1023px) calc(50vw - 40px),
                420px
              "
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          ) : (
            !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#EAD8C9]/40 font-dm-sans text-xs uppercase tracking-[0.2em] text-hard-brown/60">
                Sin imagen
              </div>
            )
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-hard-brown/60 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="line-clamp-2 font-mileast text-2xl leading-[1.05] tracking-[-0.02em] text-hard-brown">
              {nombre}
            </h3>
            {num && (
              <span
                aria-hidden="true"
                className="shrink-0 font-mileast text-lg leading-none text-hard-brown/35"
              >
                {num}
              </span>
            )}
          </div>

          <div className="flex min-h-11 items-center justify-between gap-3">
            <p className="font-dm-sans text-sm font-semibold uppercase tracking-[0.16em] text-[#433227]">
              S/{precio}
            </p>
            <span
              aria-hidden="true"
              className="font-dm-sans text-[0.7rem] uppercase tracking-[0.18em] text-hard-brown transition-opacity duration-200 group-hover:opacity-70"
            >
              Ver pieza →
            </span>
          </div>
        </div>
      </Link>
      </Reveal>
    </li>
  );
}
