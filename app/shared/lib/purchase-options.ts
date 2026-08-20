import type { ProductOption } from "@/app/shared/types/product-option.types";
import type { CartItem } from "@/app/shared/types/cart.types";
import type { Product } from "@/app/shared/types/product.types";

export interface PurchaseOption {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export function getPurchaseOptions(
  productOptions: ProductOption[]
): PurchaseOption[] {
  return productOptions
    .filter((option) => option.activo)
    .sort((first, second) => first.cantidad - second.cantidad)
    .map(({ id, nombre, cantidad, precio }) => ({
      id,
      nombre,
      cantidad,
      precio,
    }));
}

export function createCartItem(
  product: Pick<Product, "id" | "nombre">,
  option: ProductOption
): CartItem {
  return {
    optionId: option.id,
    productId: product.id,
    productName: product.nombre,
    optionName: option.nombre,
    unitsPerOption: option.cantidad,
    optionPrice: option.precio,
    quantity: 1,
  };
}
 
