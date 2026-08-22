"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ROUTES } from "@/app/shared/routes/routes";

interface ProductCardProps {
  slug: string;
  imageSrc: string | null;
  nombre: string;
  precio: number;
}

export default function ProductCard({
  slug,
  imageSrc,
  nombre,
  precio,
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(() => Boolean(imageSrc));
  const [hasError, setHasError] = useState(false);


  return (
    <Link
      href={ROUTES.PRODUCT(slug)}
      className="group flex min-w-0 flex-col gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        {isLoading && (
          <div
            aria-hidden="true"
            className="absolute inset-0 animate-pulse bg-neutral-200"
          />
        )}

        {imageSrc && !hasError ? (
          <Image
            className={`object-cover transition duration-500 group-hover:scale-[1.02] ${
              isLoading ? "opacity-0" : "opacity-100"
            }`}
            src={imageSrc}
            alt={nombre}
            fill
            sizes="
              (max-width: 639px) calc(100vw - 12px),
              (max-width: 1023px) calc(50vw - 16px),
              (max-width: 1279px) calc(33vw - 24px),
              390px
            "
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 font-dm-sans text-sm text-neutral-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="line-clamp-2 font-dm-sans text-xl leading-tight text-hard-brown sm:text-2xl">
          {nombre}
        </h3>

        <p className="font-dm-sans text-base font-semibold text-neutral-700 sm:text-lg">
          S/{precio}
        </p>
      </div>
    </Link>
  );
}
