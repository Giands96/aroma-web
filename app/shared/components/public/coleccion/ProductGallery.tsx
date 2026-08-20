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
    <div className="h-full">
      <figure className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 md:min-h-[650px] lg:h-full lg:aspect-auto">
        <Image
          src={selectedImage.secure_url}
          alt={`${productName} - imagen ${selectedIndex + 1}`}
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          className="object-cover object-center"
        />

        {images.length > 1 ? (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {images.map((image, index) => {
              const isSelected = selectedIndex === index;

              return (
                <button
                  key={`${image.secure_url}-${index}`}
                  type="button"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`Ver imagen ${index + 1} de ${productName}`}
                  aria-pressed={isSelected}
                  className={`size-2 rounded-full shadow-sm transition-transform hover:scale-125 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                    isSelected ? "bg-white" : "bg-white/70 hover:bg-white"
                  }`}
                />
              );
            })}
          </div>
        ) : null}
      </figure>
    </div>
  );
}
