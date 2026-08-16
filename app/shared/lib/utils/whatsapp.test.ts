import { describe, expect, it } from "vitest";
import { buildProductWhatsAppUrl, buildWhatsAppUrl } from "./whatsapp";

describe("buildWhatsAppUrl", () => {
  it("formats a direct quote from an administrator-defined option", () => {
    const url = buildWhatsAppUrl(
      "51945513054",
      [{
        optionId: "gift-option",
        productId: "product-id",
        productName: "Vela Aurora",
        optionName: "Pack regalo",
        unitsPerOption: 6,
        optionPrice: 65,
        quantity: 1,
      }],
      "Hola Aroma, quiero consultar por {producto_name}: {producto_cantidad} x {producto_precio}"
    );

    expect(decodeURIComponent(url)).toContain("Hola Aroma, quiero consultar por Vela Aurora: 1 x S/");
  });

  it("formats a selected product option with the configured product template", () => {
    const url = buildProductWhatsAppUrl(
      "51945513054",
      {
        optionId: "gift-option",
        productId: "product-id",
        productName: "Vela Aurora",
        optionName: "Pack regalo",
        unitsPerOption: 6,
        optionPrice: 65,
        quantity: 1,
      },
      "Hola, quiero cotizar {producto_name}: {producto_cantidad} x {producto_precio}; total {producto_total}"
    );

    expect(decodeURIComponent(url)).toBe(
      "https://wa.me/51945513054?text=Hola, quiero cotizar Vela Aurora: 1 x S/65; total S/65"
    );
  });
});
