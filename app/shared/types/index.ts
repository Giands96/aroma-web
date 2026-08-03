import type { ProductOption } from "./product-option.types";

export type { ProductOption } from "./product-option.types";

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
  product_options?: ProductOption[];
}

export interface CartItem {
  optionId: string;
  productId: string;
  productName: string;
  optionName: string;
  unitsPerOption: number;
  optionPrice: number;
  quantity: number;
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
