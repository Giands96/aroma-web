"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImage {
  secure_url: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({
  images,
  productName,
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex];

  /*
   * Si por alguna razón el producto no tiene imágenes,
   * mostramos un espacio neutral y evitamos romper el render.
   */
  if (!selectedImage) {
    return (
      <div
        className="
          flex aspect-square
          items-center justify-center
          bg-hard-brown/5
          md:min-h-[calc(100svh-7.5rem)]
        "
      >
        <span
          className="
            font-dm-sans text-xs
            uppercase tracking-[0.2em]
            text-hard-brown/50
          "
        >
          Imagen no disponible
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Imagen seleccionada */}
      <figure
        className="
          relative aspect-[4/5]
          w-full overflow-hidden
          bg-hard-brown/5
          md:flex-1 md:aspect-auto
          md:min-h-[650px]
        "
      >
        <Image
          src={selectedImage.secure_url}
          alt={`${productName} - imagen ${selectedIndex + 1}`}
          fill
          sizes="
            (max-width: 767px) 100vw,
            (max-width: 1279px) 58vw,
            66vw
          "
          className="object-cover object-center"
        />

        {/* Índice */}
        <div
          className="
            absolute bottom-0 right-0
            border-l border-t
            border-hard-brown/30
            bg-[#FCFAF7]
            px-4 py-3
            font-dm-sans
            text-[0.65rem]
            tracking-[0.18em]
            text-hard-brown
          "
        >
          {String(selectedIndex + 1).padStart(2, "0")}
          {" / "}
          {String(images.length).padStart(2, "0")}
        </div>
      </figure>

      {/* Miniaturas */}
      {images.length > 1 ? (
        <div
          className="
            flex overflow-x-auto
            border-t border-hard-brown/30
          "
          role="list"
          aria-label="Imágenes del producto"
        >
          {images.map((image, index) => {
            const isSelected = selectedIndex === index;

            return (
              <button
                key={`${image.secure_url}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                aria-label={`Mostrar imagen ${index + 1} de ${productName}`}
                aria-pressed={isSelected}
                className={`
                  relative aspect-square
                  w-24 shrink-0
                  overflow-hidden
                  border-r border-hard-brown/30
                  transition-opacity
                  focus-visible:z-10
                  focus-visible:outline
                  focus-visible:outline-2
                  focus-visible:outline-hard-brown
                  sm:w-28
                  lg:w-32
                  ${
                    isSelected
                      ? "opacity-100"
                      : "opacity-55 hover:opacity-100"
                  }
                `}
              >
                <Image
                  src={image.secure_url}
                  alt=""
                  fill
                  sizes="128px"
                  className="object-cover"
                />

                {isSelected ? (
                  <span
                    aria-hidden="true"
                    className="
                      absolute inset-x-0 bottom-0
                      h-0.5 bg-hard-brown
                    "
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}