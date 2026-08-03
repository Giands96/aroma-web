import { describe, expect, it } from "vitest";
import { getPurchaseOptions } from "../purchase-options";

describe("Opciones de compra", () => {
  it("muestra solo opciones activas ordenadas por cantidad", () => {
    const options = getPurchaseOptions([
      {
        id: "gift",
        nombre: "Pack regalo",
        cantidad: 6,
        precio: 65,
        activo: true,
        product_id: "product-id",
      },
      {
        id: "unit",
        nombre: "Unidad",
        cantidad: 1,
        precio: 12.5,
        activo: true,
        product_id: "product-id",
      },
      {
        id: "hidden",
        nombre: "Oculta",
        cantidad: 3,
        precio: 35,
        activo: false,
        product_id: "product-id",
      },
    ]);

    expect(options).toEqual([
      {
        id: "unit",
        nombre: "Unidad",
        cantidad: 1,
        precio: 12.5,
      },
      {
        id: "gift",
        nombre: "Pack regalo",
        cantidad: 6,
        precio: 65,
      },
    ]);
  });
});