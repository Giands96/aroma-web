"use client";

import Link from "next/link";
import { ROUTES } from "@/app/shared/routes/routes";

export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-[#F4EDE9] px-6 py-24 text-center text-hard-brown">
      <p className="font-dm-sans text-xs uppercase tracking-[0.24em] text-hard-brown/80">
        Aroma
      </p>
      <h1 className="font-mileast text-4xl font-normal uppercase leading-none tracking-[-0.03em] md:text-6xl">
        Algo salió mal
      </h1>
      <p className="max-w-md font-dm-sans text-sm leading-6 text-[#433227] md:text-base">
        No pudimos cargar esta sección. Probá de nuevo en unos segundos.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex min-h-11 items-center justify-center rounded-[2px] bg-hard-brown px-5 py-3 font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#F4EDE9] transition-colors duration-200 hover:bg-[#6d5540] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hard-brown"
        >
          Reintentar
        </button>
        <Link
          href={ROUTES.HOME}
          className="inline-flex min-h-11 items-center justify-center border-b border-hard-brown px-1 font-dm-sans text-xs uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-70"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
