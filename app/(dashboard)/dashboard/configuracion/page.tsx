import React from 'react';

import { getWhatsAppConfig } from "@/app/shared/services/config.service";
import WhatsAppForm from "./WhatsAppForm";

export default async function ConfiguracionPage() {
  const config = await getWhatsAppConfig();

  return (
    <div className="space-y-6">
      <div>
        <p className="font-dm-sans text-sm font-medium text-zinc-500">Preferencias</p>
        <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">Configuración</h1>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-dm-sans text-sm font-semibold text-zinc-950">
          WhatsApp
        </h2>
        <p className="mt-1 font-dm-sans text-sm leading-6 text-zinc-500">
          Define el número de contacto y los mensajes que recibirás desde el carrito y los productos.
          Puedes usar {"{producto_name}"}, {"{producto_cantidad}"}, {"{producto_precio}"}, {"{producto_total}"} y {"{carrito_total}"}.
        </p>
      </div>

      <WhatsAppForm initialConfig={config}  />
    </div>
  );
}
