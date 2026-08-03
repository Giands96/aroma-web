import type { ProductOption } from "@/app/shared/types/product-option.types";

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
 
