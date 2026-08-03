"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartLimits } from "@/app/shared/types";

const DEFAULT_LIMITS = {
  max_items: 10,
  max_quantity_per_item: 99,
};

type CartMutationResult = { success: true } | { success: false; message: string };

export function getCartItemKey(item: CartItem): string {
  return item.optionId;
}

export function getCartItemTotal(item: CartItem): number {
  return item.optionPrice * item.quantity;
}

interface CartState {
  items: CartItem[];
  limits: Pick<CartLimits, "max_items" | "max_quantity_per_item">;
  addItem: (item: CartItem) => CartMutationResult;
  clearCart: () => void;
  removeItem: (optionId: string) => void;
  setLimits: (limits: Pick<CartLimits, "max_items" | "max_quantity_per_item">) => void;
  totalItems: () => number;
  totalPrice: () => number;
  updateQuantity: (optionId: string, quantity: number) => CartMutationResult;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      limits: DEFAULT_LIMITS,
      addItem: (item) => {
        const existingItem = get().items.find(
          (currentItem) => getCartItemKey(currentItem) === getCartItemKey(item)
        );

        if (existingItem) {
          return get().updateQuantity(item.optionId, existingItem.quantity + item.quantity);
        }

        if (get().items.length >= get().limits.max_items) {
          return { success: false, message: "Máximo de opciones distintas en el carrito" };
        }

        if (item.quantity > get().limits.max_quantity_per_item) {
          return {
            success: false,
            message: `Máximo ${get().limits.max_quantity_per_item} unidades por opción`,
          };
        }

        set({ items: [...get().items, item] });
        return { success: true };
      },
      clearCart: () => set({ items: [] }),
      removeItem: (optionId) =>
        set({ items: get().items.filter((item) => item.optionId !== optionId) }),
      setLimits: (limits) => set({ limits }),
      totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      totalPrice: () => get().items.reduce((total, item) => total + getCartItemTotal(item), 0),
      updateQuantity: (optionId, quantity) => {
        if (quantity < 1) {
          get().removeItem(optionId);
          return { success: true };
        }

        if (quantity > get().limits.max_quantity_per_item) {
          return {
            success: false,
            message: `Máximo ${get().limits.max_quantity_per_item} unidades por opción`,
          };
        }

        set({
          items: get().items.map((item) =>
            item.optionId === optionId ? { ...item, quantity } : item
          ),
        });
        return { success: true };
      },
    }),
    {
      name: "aroma-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
