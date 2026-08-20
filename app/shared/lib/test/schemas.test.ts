import { describe, expect, it } from "vitest";
import { cartLimitsSchema, whatsappConfigSchema } from "../validations/config.schema";
import { productOptionSchema } from "../validations/product-option.schema";
import { productSchema } from "../validations/product.schema";

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

describe("productOptionSchema", () => {
  it("accepts a positive option quantity and price", () => {
    const result = productOptionSchema.safeParse({
      nombre: "Caja x6",
      cantidad: 6,
      precio: 84.9,
      activo: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects an option with more than 99 candles", () => {
    const result = productOptionSchema.safeParse({ nombre: "Caja x100", cantidad: 100, precio: 84.9 });

    expect(result.success).toBe(false);
  });
});

describe("configuration schemas", () => {
  it("accepts an international WhatsApp number and safe cart limits", () => {
    expect(
      whatsappConfigSchema.safeParse({
        telefono: "51945513054",
        mensaje_carrito: "Hola Aroma, quiero cotizar mi carrito:",
        mensaje_producto: "Hola Aroma, quiero consultar por {producto_name}.",
      }).success
    ).toBe(true);

    expect(
      whatsappConfigSchema.safeParse({
        telefono: "945513054",
        mensaje_carrito: "Hola Aroma, quiero cotizar mi carrito:",
        mensaje_producto: "Hola Aroma, quiero consultar por {producto_name}.",
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
