import { describe, expect, it } from "vitest";
import { buildCartPreviewMessage } from "./cart-preview";

const items = [
  {
    optionId: "opt-1",
    productId: "p-1",
    productName: "Vela Aurora",
    optionName: "Unidad",
    unitsPerOption: 1,
    optionPrice: 12.5,
    quantity: 2,
  },
  {
    optionId: "opt-2",
    productId: "p-2",
    productName: "Jabón Nube",
    optionName: "Pack x3",
    unitsPerOption: 3,
    optionPrice: 20,
    quantity: 1,
  },
];

describe("buildCartPreviewMessage", () => {
  it("renders one line per item plus the estimated total", () => {
    const message = buildCartPreviewMessage(
      items,
      "{producto_name} x{producto_cantidad} = {producto_total} (total {carrito_total})",
    );

    expect(message).toContain("Vela Aurora · Unidad x2 = S/25 (total S/45)");
    expect(message).toContain("Jabón Nube · Pack x3 x1 = S/20 (total S/45)");
    expect(message).toContain("Total estimado: S/45");
  });

  it("keeps unknown placeholders untouched", () => {
    const message = buildCartPreviewMessage([items[0]], "Hola {desconocido}");

    expect(message).toContain("{desconocido}");
  });

  it("returns only the total line for an empty cart", () => {
    expect(buildCartPreviewMessage([], "Hola")).toBe("\nTotal estimado: S/0");
  });
});
