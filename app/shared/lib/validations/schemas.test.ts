import { describe, expect, it } from "vitest";
import { cartLimitsSchema, whatsappConfigSchema } from "./config.schema";
import { packSchema } from "./pack.schema";
import { productSchema } from "./product.schema";

describe("productSchema", () => {
  it("accepts a publishable candle product", () => {
    const result = productSchema.safeParse({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      activo: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a slug that is not URL-safe", () => {
    const result = productSchema.safeParse({
      nombre: "Vela Aurora",
      slug: "Vela Aurora!",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
    });

    expect(result.success).toBe(false);
  });
});

describe("packSchema", () => {
  it("accepts a positive pack quantity and price", () => {
    const result = packSchema.safeParse({
      cantidad: 6,
      precio: 84.9,
      activo: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects a pack with more than 99 candles", () => {
    const result = packSchema.safeParse({ cantidad: 100, precio: 84.9 });

    expect(result.success).toBe(false);
  });
});

describe("configuration schemas", () => {
  it("accepts an international WhatsApp number and safe cart limits", () => {
    expect(
      whatsappConfigSchema.safeParse({
        telefono: "51945513054",
        mensaje_base: "Hola Aroma, quiero consultar por:",
        mensaje_personalizado: "Hola Aroma, quiero un pedido personalizado!",
      }).success
    ).toBe(true);

    expect(
      cartLimitsSchema.safeParse({
        max_items: 10,
        max_quantity_per_item: 99,
      }).success
    ).toBe(true);
  });
});
