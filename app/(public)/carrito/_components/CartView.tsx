"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildCartPreviewMessage } from "@/app/shared/lib/cart-preview";
import { buildWhatsAppUrl } from "@/app/shared/lib/utils/whatsapp";
import {
  getCartItemTotal,
  useCartStore,
} from "@/app/shared/stores/cart.store";
import { ROUTES } from "@/app/shared/routes/routes";

interface CartViewProps {
  phone: string;
  messageTemplate: string;
}

export default function CartView({ phone, messageTemplate }: CartViewProps) {
  const items = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.totalItems);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const [lineError, setLineError] = useState<string | null>(null);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const preview = useMemo(
    () => buildCartPreviewMessage(items, messageTemplate),
    [items, messageTemplate],
  );

  const handleQuantityChange = (optionId: string, quantity: number) => {
    const result = updateQuantity(optionId, quantity);
    setLineError(result.success ? null : result.message);
  };

  const handleRemove = (optionId: string) => {
    removeItem(optionId);
    setLineError(null);
  };

  const handleClear = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearCart();
    setConfirmingClear(false);
    setLineError(null);
  };

  const handleCheckout = () => {
    if (items.length === 0 || !phone) return;
    window.open(
      buildWhatsAppUrl(phone, items, messageTemplate),
      "_blank",
      "noopener,noreferrer",
    );
  };

  if (items.length === 0) {
    return (
      <section className="py-16 text-center">
        <p className="font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
          Tu carrito está vacío
        </p>
        <p className="mt-4 font-dm-sans text-lg text-neutral-600">
          Explorá la colección y sumá tus productos favoritos.
        </p>
        <Link
          href={ROUTES.COLECCION}
          className="mt-8 inline-flex min-h-14 items-center justify-center bg-hard-brown px-8 font-dm-sans text-sm font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90"
        >
          Ver colección
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
      <section aria-label="Productos en el carrito">
        <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((item) => (
            <li key={item.optionId} className="flex gap-4 py-5">
              <div className="min-w-0 flex-1">
                <p className="font-dm-sans text-base font-medium text-neutral-900">
                  {item.productName}
                </p>
                <p className="mt-1 font-dm-sans text-sm text-neutral-500">
                  {item.optionName} · S/ {item.optionPrice}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      type="button"
                      aria-label={`Quitar una unidad de ${item.productName}`}
                      onClick={() =>
                        handleQuantityChange(item.optionId, item.quantity - 1)
                      }
                      className="px-3 py-2 font-dm-sans text-base text-neutral-700 hover:bg-neutral-100"
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-8 text-center font-dm-sans text-sm text-neutral-900"
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Agregar una unidad de ${item.productName}`}
                      onClick={() =>
                        handleQuantityChange(item.optionId, item.quantity + 1)
                      }
                      className="px-3 py-2 font-dm-sans text-base text-neutral-700 hover:bg-neutral-100"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.optionId)}
                    className="font-dm-sans text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <p className="font-dm-sans text-base font-medium text-neutral-900">
                S/ {getCartItemTotal(item)}
              </p>
            </li>
          ))}
        </ul>

        {lineError ? (
          <p role="alert" className="mt-4 font-dm-sans text-sm text-red-600">
            {lineError}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handleClear}
          className="mt-6 font-dm-sans text-sm text-neutral-500 underline-offset-4 hover:text-neutral-900 hover:underline"
        >
          {confirmingClear ? "Confirmar: vaciar carrito" : "Vaciar carrito"}
        </button>
      </section>

      <aside
        aria-label="Resumen de cotización"
        className="h-fit border border-neutral-200 p-6 lg:sticky lg:top-28"
      >
        <p className="font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
          Resumen
        </p>
        <div className="mt-4 flex items-center justify-between font-dm-sans text-sm text-neutral-700">
          <span>Productos ({totalItems()})</span>
          <span className="font-medium text-neutral-900">
            S/ {totalPrice()}
          </span>
        </div>
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <p className="font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
            Vista previa de tu cotización
          </p>
          <pre className="mt-3 max-h-64 overflow-y-auto whitespace-pre-wrap bg-neutral-50 p-4 font-dm-sans text-sm leading-6 text-neutral-700">
            {preview}
          </pre>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={items.length === 0 || !phone}
          className="mt-6 flex min-h-14 w-full items-center justify-center bg-hard-brown px-6 font-dm-sans text-sm font-medium uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cotizar por WhatsApp
        </button>
        {!phone ? (
          <p role="alert" className="mt-3 font-dm-sans text-sm text-red-600">
            Cotización por WhatsApp no disponible en este momento.
          </p>
        ) : null}
      </aside>
    </div>
  );
}
