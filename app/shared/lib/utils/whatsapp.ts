import type { CartItem } from "@/app/shared/types";
import { getCartItemTotal } from "@/app/shared/stores/cart.store";
import { formatCurrency } from "./currency";

interface WhatsAppTemplateValues {
  producto_name: string;
  producto_cantidad: string;
  producto_precio: string;
  producto_total: string;
  carrito_total: string;
}

export function renderWhatsAppTemplate(
  template: string,
  values: Partial<WhatsAppTemplateValues>
): string {
  return template.replace(/\{([a-z_]+)\}/g, (placeholder, key: string) => {
    return values[key as keyof WhatsAppTemplateValues] ?? placeholder;
  });
}

export function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  messageTemplate: string
): string {
  const total = items.reduce((sum, item) => sum + getCartItemTotal(item), 0);
  const lines = items.map((item) =>
    renderWhatsAppTemplate(messageTemplate, {
      producto_name: item.productName,
      producto_cantidad: String(item.quantity),
      producto_precio: formatCurrency(item.optionPrice),
      producto_total: formatCurrency(getCartItemTotal(item)),
      carrito_total: formatCurrency(total),
    })
  );
  const message = [...lines, "", `Total estimado: ${formatCurrency(total)}`].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(
  phone: string,
  item: CartItem,
  messageTemplate: string
): string {
  const message = renderWhatsAppTemplate(messageTemplate, {
    producto_name: item.productName,
    producto_cantidad: String(item.quantity),
    producto_precio: formatCurrency(item.optionPrice),
    producto_total: formatCurrency(getCartItemTotal(item)),
  });

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
