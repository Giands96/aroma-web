import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ROUTES } from "@/app/shared/routes/routes";

const STEPS = [
  {
    num: "01",
    title: "Idea",
    text: "Conversamos sobre el momento, concepto o identidad que deseas representar.",
  },
  {
    num: "02",
    title: "Diseño",
    text: "Seleccionamos fragancia, recipiente, color y presentación.",
  },
  {
    num: "03",
    title: "Creación",
    text: "Elaboramos cada pieza artesanalmente y cuidamos sus acabados.",
  },
] as const;

export default function PersonalizationSection() {
  return (
    <section
      aria-labelledby="personalization-title"
      className="w-full bg-[#3A2D21] text-[#F4EDE9]"
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        {/* Encabezado respirable — un solo borde, sin celda vacía */}
        <header className="grid grid-cols-1 gap-6 border-b border-[#F4EDE9]/20 py-12 md:grid-cols-12 md:items-end lg:py-16">
          <div className="md:col-span-7 lg:col-span-8">
            <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.24em] text-[#EAD8C9]/80">
              N.º 02 — Servicio · Hecho a medida
            </p>
            <h2
              id="personalization-title"
              className="mt-4 font-mileast text-[clamp(2.8rem,7vw,7.5rem)] font-normal uppercase leading-[0.85] tracking-[-0.05em]"
            >
              Personalización
            </h2>
          </div>

          <div className="md:col-span-5 lg:col-span-4">
            <p className="max-w-md font-dm-sans text-sm leading-6 text-[#F4EDE9]/85 lg:text-base lg:leading-7">
              Creamos velas personalizadas a partir de tu historia, el ambiente
              que deseas construir y los detalles que hacen único cada momento.
            </p>
            <Link
              href={ROUTES.PERSONALIZACION}
              className="group mt-6 inline-flex min-h-11 items-center gap-3 border-b border-[#F4EDE9]/60 pb-1 font-dm-sans text-xs uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4EDE9]"
            >
              Descubrir el servicio
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </header>

        {/* Hero único — imagen protagonista grande */}
        <div className="grid grid-cols-1 items-center gap-10 py-12 md:grid-cols-12 lg:gap-14 lg:py-20">
          <figure className="relative overflow-hidden rounded-[2px] border border-[#F4EDE9]/25 md:col-span-7 lg:col-span-8">
            <div className="relative aspect-[4/3] w-full min-h-[320px] sm:min-h-[420px] md:aspect-[16/10] md:min-h-[480px] lg:min-h-[580px]">
              <Image
                src="/imagen-1-grid.jpg"
                alt="Vela personalizada junto a su empaque"
                fill
                priority
                sizes="(max-width: 767px) 100vw, 66vw"
                className="object-cover object-[center_45%] sepia-[0.14] contrast-[1.03] saturate-[0.9]"
              />
            </div>
            <figcaption className="flex items-center justify-between border-t border-[#F4EDE9]/25 bg-[#2B2119] px-4 py-3 font-dm-sans text-[0.65rem] uppercase tracking-[0.16em] text-[#F4EDE9]/85">
              <span>Colección personalizada · 2026</span>
              <span className="hidden sm:inline">Vertido a mano</span>
            </figcaption>
          </figure>

          <article className="md:col-span-5 lg:col-span-4">
            <p className="font-dm-sans text-[0.8rem] uppercase tracking-[0.22em] text-[#EAD8C9]/80">
              Nuestra filosofía
            </p>
            <p className="mt-5 font-mileast text-[clamp(2.4rem,4.5vw,4.5rem)] leading-[0.92] tracking-[-0.04em] text-balance">
              Tu historia, convertida en aroma.
            </p>
            <p className="mt-6 max-w-md font-dm-sans text-sm leading-6 text-[#F4EDE9]/85 lg:text-base lg:leading-7">
              Diseñada para representar tus momentos. Sin formularios eternos:
              una conversación, una propuesta, una pieza única.
            </p>
          </article>
        </div>

        {/* Proceso — lista calma, sin celdas encerradas */}
        <ol className="grid grid-cols-1 gap-10 border-t border-[#F4EDE9]/20 py-12 md:grid-cols-3 lg:py-16">
          {STEPS.map((step) => (
            <li key={step.num} className="flex flex-col">
              <span
                aria-hidden="true"
                className="font-mileast text-5xl leading-none tracking-[-0.04em] text-[#F4EDE9]/25 lg:text-6xl"
              >
                {step.num}
              </span>
              <h3 className="mt-4 font-dm-sans text-sm font-semibold uppercase tracking-[0.18em]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-xs font-dm-sans text-sm leading-6 text-[#F4EDE9]/85">
                {step.text}
              </p>
            </li>
          ))}
        </ol>

        {/* Cierre — invertido para que reviente sobre el fondo oscuro */}
        <div className="pb-12 lg:pb-16">
          <Link
            href={ROUTES.PERSONALIZACION}
            className="group flex flex-col gap-6 rounded-[2px] bg-[#F4EDE9] p-6 text-[#3A2D21] transition-colors duration-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F4EDE9] sm:p-8 md:flex-row md:items-center md:justify-between lg:p-10"
          >
            <div>
              <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em] text-[#3A2D21]/70">
                Iniciar proyecto
              </p>
              <p className="mt-2 font-mileast text-3xl leading-none tracking-[-0.03em] lg:text-4xl">
                Cuéntanos tu idea
              </p>
            </div>
            <span className="inline-flex min-h-11 w-fit items-center gap-3 rounded-[2px] bg-[#3A2D21] px-5 py-3 font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#F4EDE9] transition-colors duration-200 group-hover:bg-[#4A3A2C]">
              Empezar
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
