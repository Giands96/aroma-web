import {
  productImagesSchema,
  type ProductImage,
} from "@/app/shared/lib/validations/product-image.schema";

interface ProductImageSource {
  imagenes?: unknown;
  imagen_public_id?: string | null;
  imagen_url?: string | null;
}

export function getProductImages(source: ProductImageSource): ProductImage[] {
  const parsedGallery = productImagesSchema.safeParse(source.imagenes);

  if (parsedGallery.success && parsedGallery.data.length > 0) {
    return parsedGallery.data;
  }

  if (source.imagen_public_id && source.imagen_url) {
    return [
      {
        public_id: source.imagen_public_id,
        secure_url: source.imagen_url,
      },
    ];
  }

  return [];
}
