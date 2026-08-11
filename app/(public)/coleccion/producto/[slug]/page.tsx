import React from "react";
import { getProductBySlug } from "@/app/shared/services/products.service";
import Image from "next/image";
import Link from "next/link";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const imagenes = getProductImages(product);

  return (
    <main className="min-h-screen bg-white mt-24">
      <div className="mx-auto w-full max-w-[1440px] p-3 md:px-6 md:py-6">
        {/* Volver */}
        <Link
          href="/coleccion"
          className="mb-6 inline-flex items-center gap-2 font-dm-sans text-sm text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="size-4" />
          Colección
        </Link>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,800px)_minmax(320px,1fr)] lg:items-start lg:gap-12">
          {/* Galería */}
          <div className="w-full max-w-[800px]">
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
              <div
                className="
                  flex h-full w-full
                  snap-x snap-mandatory
                  overflow-x-auto
                  scroll-smooth
                  [scrollbar-width:none]
                  [-ms-overflow-style:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {imagenes.map((imagen, index) => (
                  <div
                    id={`imagen-${index}`}
                    key={imagen.secure_url}
                    className="relative h-full w-full shrink-0 snap-center"
                  >
                    <Image
                      src={imagen.secure_url}
                      alt={`${product.nombre} - imagen ${index + 1}`}
                      fill
                      priority={index === 0}
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* Indicadores */}
              {imagenes.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  {imagenes.map((imagen, index) => (
                    <a
                      key={imagen.secure_url}
                      href={`#imagen-${index}`}
                      aria-label={`Ver imagen ${index + 1}`}
                      className="size-2 rounded-full bg-white/70 shadow-sm transition-transform hover:scale-125 hover:bg-white"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="w-full lg:sticky lg:top-24">
            {/* Encabezado */}
            <div className="border-b border-neutral-200 pb-6">
              <p className="mb-3 font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
                Aroma · Colección
              </p>

              <h1 className="text-4xl leading-tight text-[#cdb9aa] md:text-5xl">
                {product.nombre}
              </h1>

              {product.descripcion && (
                <p className="mt-5 max-w-xl font-dm-sans text-lg  leading-7 text-neutral-600">
                  {product.descripcion}
                </p>
              )}
            </div>

            {/* Presentaciones */}
            {product.product_options && product.product_options.length > 0 && (
              <div className="border-b border-neutral-200 py-6">
                <p className="mb-4 font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Presentaciones
                </p>

                <div className="flex flex-wrap gap-2">
                  {product.product_options.map((opcion) => (
                    <div
                      key={opcion.id}
                      className="min-w-24 border border-neutral-200 px-4 py-3"
                    >
                      <p className="font-dm-sans text-sm font-medium text-neutral-900">
                        {opcion.nombre}
                      </p>

                      <p className="mt-1 font-dm-sans text-sm text-neutral-600">
                        S/ {opcion.precio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disponibilidad */}
            <div className="border-b border-neutral-200 py-6">
              <div className="flex items-center justify-between gap-4">
                <p className="font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
                  Disponibilidad
                </p>

                <p className="font-dm-sans text-sm text-neutral-700">
                  Disponible
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-6">
              <Link
                href={`/personalizacion?producto=${product.slug}`}
                className="
                  flex min-h-14 w-full
                  items-center justify-center
                  bg-[#cdb9aa]
                  px-6
                  font-dm-sans
                  text-sm
                  font-medium
                  uppercase
                  tracking-[0.14em]
                  text-white
                  transition-opacity
                  hover:opacity-90
                "
              >
                Personalizar esta pieza
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}