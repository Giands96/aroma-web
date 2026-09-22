import type { Metadata } from "next";
import { getPublicWhatsAppConfig } from "@/app/shared/services/config.service";
import Reveal from "@/app/shared/components/ui/Reveal";
import CartView from "./_components/CartView";

export const metadata: Metadata = {
  title: "Carrito",
  description: "Revisá tu carrito y cotizalo por WhatsApp.",
};

export default async function Page() {
  const whatsappConfig = await getPublicWhatsAppConfig();

  return (
    <main className="min-h-screen bg-white mt-24">
      <div className="mx-auto w-full max-w-360 p-3 md:px-6 md:py-6">
        
        <p className="mb-3 font-dm-sans text-xs uppercase tracking-[0.18em] text-neutral-400">
          Aroma · Carrito
        </p>
        <h1 className="text-4xl leading-tight text-hard-brown md:text-5xl">
          Tu carrito
        </h1>
        
        <div className="mt-8">
          <CartView
            phone={whatsappConfig.telefono}
            messageTemplate={whatsappConfig.mensaje_carrito}
          />
        </div>
      </div>
    </main>
  );
}
