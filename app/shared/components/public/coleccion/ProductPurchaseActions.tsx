"use client";

import { useState } from "react";
import { createCartItem } from "@/app/shared/lib/purchase-options";
import { buildProductWhatsAppUrl } from "@/app/shared/lib/utils/whatsapp";
import { useCartStore } from "@/app/shared/stores/cart.store";
import type { Product } from "@/app/shared/types/product.types";
import type { ProductOption } from "@/app/shared/types/product-option.types";

interface ProductPurchaseActionsProps {
  product: Product;
  phone: string;
  messageTemplate: string;
}

export default function ProductPurchaseActions({
  product,
  phone,
  messageTemplate,
}: ProductPurchaseActionsProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedOption, setSelectedOption] = useState<ProductOption | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const cartItem = selectedOption ? createCartItem(product, selectedOption) : null;

  const handleAddToCart = () => {
    if (!cartItem) return;

    const result = addItem(cartItem);
    setCartError(result.success ? null : result.message);
  };

  const handleWhatsAppQuote = () => {
    if (!cartItem || !phone) return;

    window.open(
      buildProductWhatsAppUrl(phone, cartItem, messageTemplate),
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <div className="border-b border-neutral-200 py-6">
        <p className="mb-4 font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
          Presentaciones
        </p>

        <div className="flex flex-wrap gap-2">
          {(product.product_options ?? []).map((option) => {
            const isSelected = selectedOption?.id === option.id;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setSelectedOption(option);
                  setCartError(null);
                }}
                aria-pressed={isSelected}
                className={`min-w-24 border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ${
                  isSelected
                    ? "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
                    : "border-neutral-200 text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <span className="block font-dm-sans text-sm font-medium">
                  {option.nombre}
                </span>
                <span className={`mt-1 block font-dm-sans text-sm ${isSelected ? "text-white/80" : "text-neutral-600"}`}>
                  S/ {option.precio}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-neutral-200 py-6">
        <div className="flex items-center justify-between gap-4">
          <p className="font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
            Disponibilidad
          </p>

          <p className="font-dm-sans text-sm text-neutral-700">
            Disponible
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-6">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!cartItem}
          className="flex min-h-14 w-full items-center justify-center bg-hard-brown px-6 font-dm-sans text-sm font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:cursor-pointer hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Añadir al carrito
        </button>

        <button
          type="button"
          onClick={handleWhatsAppQuote}
          disabled={!cartItem || !phone}
          className="flex min-h-14 w-full items-center justify-center border border-hard-brown px-6 font-dm-sans text-sm font-medium uppercase tracking-[0.14em] text-hard-brown transition-colors hover:cursor-pointer hover:bg-[#cdb9aa]/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cotizar producto por WhatsApp
        </button>

        {cartError ? (
          <p role="alert" className="font-dm-sans text-sm text-red-600">
            {cartError}
          </p>
        ) : null}
      </div>
    </>
  );
}
