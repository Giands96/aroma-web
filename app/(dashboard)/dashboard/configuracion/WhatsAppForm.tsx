"use client";

import { useTransition, useState } from "react";
import { updateWhatsAppConfigAction } from "@/app/shared/actions/config.actions";
import type { WhatsAppConfig } from "@/app/shared/types";

interface WhatsAppFormProps {
  config: WhatsAppConfig;
}

export default function WhatsAppForm({ config }: WhatsAppFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [telefono, setTelefono] = useState(config.telefono);
  const [mensajeCarrito, setMensajeCarrito] = useState(config.mensaje_carrito);
  const [mensajeProducto, setMensajeProducto] = useState(config.mensaje_producto);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await updateWhatsAppConfigAction({
        telefono,
        mensaje_carrito: mensajeCarrito,
        mensaje_producto: mensajeProducto,
      });

      if (result?.serverError) {
        setMessage({ type: "error", text: result.serverError });
      } else {
        setMessage({ type: "success", text: "Configuración actualizada correctamente." });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
      {message && (
        <div
          className={`rounded-md border px-4 py-3 font-dm-sans text-sm ${
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label htmlFor="telefono" className="block font-dm-sans text-sm font-medium text-zinc-700">
          Número de WhatsApp
        </label>
        <input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          required
          pattern="\d{9,15}"
          className="mt-2 block min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 font-dm-sans text-sm text-zinc-950 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
          placeholder="945513054"
        />
        <p className="mt-1 font-dm-sans text-xs text-zinc-500">
          Solo dígitos. Puedes ingresar entre 9 y 15 caracteres.
        </p>
        <p className="mt-2 rounded-md bg-zinc-50 px-3 py-2 font-dm-sans text-xs text-zinc-600">
          Se guardará como: {telefono.replace(/\D/g, "") || "sin definir"}
        </p>
      </div>

      <div>
          <label htmlFor="mensajeCarrito" className="block font-dm-sans text-sm font-medium text-zinc-700">
          Plantilla para el carrito
        </label>
        <textarea
          id="mensajeCarrito"
          value={mensajeCarrito}
          onChange={(e) => setMensajeCarrito(e.target.value)}
          required
          minLength={1}
          maxLength={500}
          rows={3}
          className="mt-2 block w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2.5 font-dm-sans text-sm text-zinc-950 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
        />
        <p className="mt-2 font-dm-sans text-xs text-zinc-500">
          Disponible: {"{producto_name}"}, {"{producto_cantidad}"}, {"{producto_precio}"}, {"{producto_total}"}, {"{carrito_total}"}.
        </p>
      </div>

      <div>
          <label htmlFor="mensajeProducto" className="block font-dm-sans text-sm font-medium text-zinc-700">
          Plantilla para el producto
        </label>
        <textarea
          id="mensajeProducto"
          value={mensajeProducto}
          onChange={(e) => setMensajeProducto(e.target.value)}
          required
          minLength={1}
          maxLength={500}
          rows={3}
          className="mt-2 block w-full resize-y rounded-md border border-zinc-200 bg-white px-3 py-2.5 font-dm-sans text-sm text-zinc-950 shadow-sm outline-none transition-shadow placeholder:text-zinc-400 focus-visible:border-zinc-400 focus-visible:ring-2 focus-visible:ring-zinc-950/10"
        />
        <p className="mt-2 font-dm-sans text-xs text-zinc-500">
          Disponible: {"{producto_name}"}, {"{producto_cantidad}"}, {"{producto_precio}"}, {"{producto_total}"}.
        </p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="min-h-11 rounded-md bg-zinc-950 px-5 py-2.5 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Guardando..." : "Guardar configuración"}
      </button>
    </form>
  );
}
