import type { CartItem } from "@/app/shared/types";
import { getCartItemTotal } from "@/app/shared/stores/cart.store";
import { formatCurrency } from "./currency";

export function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  messageBase: string
): string {
  const lines = items.map((item) =>
    `${item.productName} - ${item.optionName}: ${item.quantity} x ${formatCurrency(item.optionPrice)} = ${formatCurrency(getCartItemTotal(item))}`
  );
  const total = items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const message = [messageBase, "", ...lines, "", `Total estimado: ${formatCurrency(total)}`].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
