export interface WhatsAppConfig {
  clave: string;
  telefono: string;
  mensaje_carrito: string;
  mensaje_producto: string;
}

export type { CartItem, CartLimits } from "./cart.types";
export type { FeaturedProduct } from "./featured-product.types";
export type { ProductOption } from "./product-option.types";
