import type { ProductImage } from "@/app/shared/lib/validations/product-image.schema";

export interface FeaturedProduct {
  id: number;
  created_at: string;
  product_id: string;
  posicion: number;
  products: {
    slug: string;
    nombre: string;
    descripcion: string;
    imagen_public_id: string | null;
    imagen_url: string | null;
    imagenes: ProductImage[];
    product_options: {
      precio: number;
    }[];
  } | null;
}
