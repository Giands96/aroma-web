import { describe, expect, it } from "vitest";
import {
  productOptionSchema,
  productOptionUpdateSchema,
} from "./product-option.schema.js";

describe("productOptionSchema", () => {
  it("acepta una presentación administrada", () => {
    expect(
      productOptionSchema.safeParse({
        nombre: "Caja x3",
        cantidad: 3,
        precio: 35,
        activo: true,
      }).success
    ).toBe(true);
  });

  it("rechaza una presentación sin nombre", () => {
    expect(
      productOptionSchema.safeParse({
        cantidad: 3,
        precio: 35,
      }).success
    ).toBe(false);
  });
  it("rechaza una presentación con nombre vacío tras recortar espacios", () => {
  expect(
    productOptionSchema.safeParse({
      nombre: "   ",
      cantidad: 3,
      precio: 35,
    }).success
  ).toBe(false);
});
  it("acepta actualizar solamente el precio sin activar la opción", () => {
    const result = productOptionUpdateSchema.safeParse({ precio: 40 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ precio: 40 });
    }
  });
});
