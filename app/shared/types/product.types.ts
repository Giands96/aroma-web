import type { ProductOption } from "./product-option.types";
import type { ProductImage } from "../lib/validations/product-image.schema";

export interface Product {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  imagen_public_id: string | null;
  imagen_url: string | null;
  imagenes?: ProductImage[] | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  product_options?: ProductOption[];
}
