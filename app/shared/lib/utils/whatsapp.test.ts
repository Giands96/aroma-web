import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl } from "./whatsapp";

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
      "Hola Aroma, quiero consultar por:"
    );

    expect(decodeURIComponent(url)).toContain("Vela Aurora - Pack regalo: 1 x S/");
  });
});
