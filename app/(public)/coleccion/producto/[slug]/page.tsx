import React from "react";
import { getProductBySlug } from "@/app/shared/services/products.service";
import Link from "next/link";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getWhatsAppConfig } from "@/app/shared/services/config.service";
import ProductPurchaseActions from "@/app/shared/components/public/coleccion/ProductPurchaseActions";
import ProductGallery from "@/app/shared/components/public/coleccion/ProductGallery";

export default async function Page({params}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const whatsappConfig = await getWhatsAppConfig();
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

        <section className="grid gap-8 lg:grid-cols-[minmax(0,800px)_minmax(320px,1fr)] lg:items-center lg:gap-12">
          {/* Galería */}
          <div className="w-full max-w-200 lg:self-stretch">
            <ProductGallery images={imagenes} productName={product.nombre} />
          </div>

          {/* Información */}
          <div className="w-full lg:self-center">
            <div className="border-b border-neutral-200 pb-6">
              <p
                className="
          mb-3
          font-dm-sans text-xs
          uppercase
          tracking-[0.18em]
          text-neutral-400
        "
              >
                Aroma · Colección
              </p>

              <h1 className="text-4xl leading-tight text-hard-brown md:text-5xl">
                {product.nombre}
              </h1>

              {product.descripcion && (
                <p
                  className="
            mt-5 max-w-xl
            font-dm-sans
            text-lg leading-7
            text-neutral-600
          "
                >
                  {product.descripcion}
                </p>
              )}
            </div>

            <ProductPurchaseActions
              product={product}
              phone={whatsappConfig.telefono}
              messageTemplate={whatsappConfig.mensaje_producto}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
