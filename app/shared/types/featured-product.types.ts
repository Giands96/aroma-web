export interface FeaturedProduct {
  id: number;
  created_at: string;
  product_id: string;
  posicion: number | null;
  products: {
    slug: string;
    nombre: string;
    descripcion: string;
    imagen_public_id: string | null;
    imagen_url: string | null;
    product_options: {
      precio: number;
    }[];
  } | null;
}