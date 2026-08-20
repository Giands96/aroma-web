import { beforeEach, describe, expect, it } from "vitest";
import { getCartItemKey, getCartItemTotal, useCartStore } from "./cart.store";

const unit = {
  optionId: "unit-option",
  productId: "product-id",
  productName: "Vela Aurora",
  optionName: "Unidad",
  unitsPerOption: 1,
  optionPrice: 12.5,
  quantity: 1,
};

describe("cart store", () => {
  beforeEach(() => useCartStore.getState().clearCart());

  it("uses the option ID as the cart line identity", () => {
    expect(getCartItemKey(unit)).toBe("unit-option");
    expect(getCartItemKey({ ...unit, optionId: "gift-option" })).not.toBe(getCartItemKey(unit));
  });

  it("calculates a line total from the selected option price", () => {
    expect(getCartItemTotal({ ...unit, quantity: 3 })).toBe(37.5);
  });

  it("merges only the same selected option and respects its quantity limit", () => {
    useCartStore.getState().setLimits({ max_items: 10, max_quantity_per_item: 2 });

    expect(useCartStore.getState().addItem(unit)).toEqual({ success: true });
    expect(useCartStore.getState().addItem(unit)).toEqual({ success: true });
    expect(useCartStore.getState().addItem(unit)).toEqual({
      success: false,
      message: "Máximo 2 unidades por opción",
    });
  });
});
