import { describe, expect, it } from "vitest";
import { createCartItem, getPurchaseOptions } from "../purchase-options";

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

  it("crea un item de carrito para la presentacion seleccionada", () => {
    expect(createCartItem(
      { id: "product-id", nombre: "Vela Aurora" },
      {
        id: "gift",
        nombre: "Pack regalo",
        cantidad: 6,
        precio: 65,
        activo: true,
        product_id: "product-id",
      }
    )).toEqual({
      optionId: "gift",
      productId: "product-id",
      productName: "Vela Aurora",
      optionName: "Pack regalo",
      unitsPerOption: 6,
      optionPrice: 65,
      quantity: 1,
    });
  });
});
