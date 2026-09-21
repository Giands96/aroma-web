import type { CartItem } from "@/app/shared/types/cart.types";
import { getCartItemTotal } from "@/app/shared/stores/cart.store";
import { renderWhatsAppTemplate } from "@/app/shared/lib/utils/whatsapp";

export function buildCartPreviewMessage(
  items: CartItem[],
  messageTemplate: string,
): string {
  const total = items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const lines = items.map((item) =>
    renderWhatsAppTemplate(messageTemplate, {
      producto_name: `${item.productName} · ${item.optionName}`,
      producto_cantidad: String(item.quantity),
      producto_precio: `S/${item.optionPrice}`,
      producto_total: `S/${getCartItemTotal(item)}`,
      carrito_total: `S/${total}`,
    }),
  );

  return [...lines, "", `Total estimado: S/${total}`].join("\n");
}
