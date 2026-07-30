export interface Product {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  imagen_public_id: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  packs?: Pack[];
}

export interface Pack {
  id: string;
  product_id: string;
  cantidad: number;
  precio: number;
  activo: boolean;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  packId: string;
  packQuantity: number;
  packPrice: number;
  itemQuantity: number;
}

export interface WhatsAppConfig {
  id: string;
  telefono: string;
  mensaje_base: string;
  mensaje_personalizado: string;
}

export interface CartLimits {
  id: string;
  max_items: number;
  max_quantity_per_item: number;
}
