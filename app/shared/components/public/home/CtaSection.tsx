import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, Flame, MapPin } from "lucide-react";
import { ROUTES } from "@/app/shared/routes/routes";

interface AtmosphereSectionProps {
  whatsappHref: string;
}

export default function AtmosphereSection({
  whatsappHref,
}: AtmosphereSectionProps) {
  return (
    <section
      aria-labelledby="atmosphere-title"
      className="w-full border-y border-hard-brown bg-[#F4EDE9] text-hard-brown"
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        {/* Encabezado editorial — continuidad con Personalización */}
        <header className="grid grid-cols-1 border-b border-hard-brown md:grid-cols-12">
          <div className="flex items-center gap-4 px-5 py-5 md:col-span-9 md:px-8 lg:px-12">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-hard-brown"
            >
              <Flame className="size-4" strokeWidth={1.5} />
            </span>
            <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.22em]">
              N.º 04 — Epílogo · Antes del adiós
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-hard-brown px-5 py-4 font-dm-sans text-[0.65rem] uppercase tracking-[0.2em] md:col-span-3 md:border-l md:border-t-0 md:px-6">
            <span className="inline-flex items-center gap-2">
              <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              Lima · Hecho a mano
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
              Lun–Sáb
            </span>
          </div>
        </header>

        {/* Cuerpo: postal vintage / cupón */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Postal / polaroid */}
          <figure className="relative flex flex-col justify-center border-b border-hard-brown p-6 md:col-span-5 md:border-b-0 md:border-r md:p-8 lg:p-12">
            <div className="relative mx-auto w-full max-w-md -rotate-1 rounded-[2px] border border-hard-brown bg-[#FAFAF9] p-3 pb-12 shadow-[6px_6px_0_0_var(--color-hard-brown)] transition-transform duration-300 hover:rotate-0">
              {/* Cintas */}
              <div
                aria-hidden="true"
                className="absolute -top-3 left-8 h-7 w-20 rotate-[-8deg] border border-hard-brown/30 bg-[#EAD8C9]/90"
              />
              <div
                aria-hidden="true"
                className="absolute -top-3 right-8 h-7 w-20 rotate-[7deg] border border-hard-brown/30 bg-[#EAD8C9]/90"
              />

              <div className="relative aspect-[4/5] overflow-hidden border border-hard-brown/40">
                <Image
                  src="/atmosfera-aroma.jpg"
                  alt="Mesa íntima iluminada por velas Aroma"
                  fill
                  sizes="(max-width: 767px) 100vw, 42vw"
                  className="object-cover object-center sepia-[0.22] contrast-[1.05] saturate-[0.85]"
                />
                {/* Grano fílmico sutil */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-multiply"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
                  }}
                />
                {/* Luz cálida */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,rgba(255,200,100,0.22)_0%,transparent_55%)]"
                />
              </div>

              <figcaption className="flex items-center justify-between pt-4 font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-hard-brown">
                <span>Atmósfera Aroma · 2026</span>
                <span className="rounded-full border border-hard-brown px-3 py-1">
                  Revelada a mano
                </span>
              </figcaption>

              {/* Sello circular */}
              <div
                aria-hidden="true"
                className="absolute -bottom-6 -right-4 flex size-24 rotate-12 items-center justify-center rounded-full border-2 border-double border-hard-brown bg-[#F4EDE9] text-center font-dm-sans text-[0.55rem] font-semibold uppercase leading-tight tracking-[0.16em] lg:size-28"
              >
                Cera
                <br />
                · Hecho a<br />
                mano ·
              </div>
            </div>
          </figure>

          {/* Declaración editorial */}
          <article className="flex min-h-[480px] flex-col justify-between border-b border-hard-brown p-6 md:col-span-4 md:border-b-0 md:border-r md:p-8 lg:min-h-[580px] lg:p-10">
            <p className="font-dm-sans text-[0.8rem] uppercase tracking-[0.22em]">
              El ritual
            </p>

            <div>
              <h2
                id="atmosphere-title"
                className="max-w-[14ch] font-mileast text-[clamp(2.6rem,4.5vw,4.8rem)] font-normal leading-[0.9] tracking-[-0.04em] text-balance"
              >
                Cuando la llama se enciende, el espacio cambia.
              </h2>

              <p className="mt-6 max-w-sm font-dm-sans text-sm leading-6 text-[#433227] lg:text-base lg:leading-7">
                Aromas, luz y textura se unen para transformar cada espacio en
                una experiencia más íntima y personal.
              </p>

              <dl className="mt-8 divide-y divide-hard-brown/40 border-y border-hard-brown/40">
                {[
                  ["01", "Aromas que abrazan la casa"],
                  ["02", "Luz cálida que baja el ritmo"],
                  ["03", "Textura artesanal que se queda"],
                ].map(([num, label]) => (
                  <div
                    key={num}
                    className="flex items-baseline gap-4 py-3 font-dm-sans text-[0.7rem] uppercase tracking-[0.18em]"
                  >
                    <dt className="text-hard-brown/70">{num}</dt>
                    <dd className="text-[#433227]">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.2em] text-hard-brown/80">
              Papel · Cera · Pabilo — oficio de siempre
            </p>
          </article>

          {/* Cupón / tarjeta perforada */}
          <aside className="relative flex min-h-[420px] flex-col bg-hard-brown p-6 text-[#F4EDE9] md:col-span-3 md:p-8">
            {/* Perforación lateral */}
            <div
              aria-hidden="true"
              className="absolute inset-y-4 -left-[7px] hidden w-[13px] flex-col justify-between md:flex"
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="size-[9px] rounded-full bg-[#F4EDE9]"
                />
              ))}
            </div>

            <p className="border border-dashed border-[#F4EDE9]/50 px-3 py-2 text-center font-dm-sans text-[0.65rem] uppercase tracking-[0.24em]">
              Cupón · Visita o pedido
            </p>

            <div className="mt-8 flex flex-1 flex-col justify-center">
              <p className="font-mileast text-4xl leading-[0.95] tracking-[-0.03em] lg:text-5xl">
                Hablemos de tu momento.
              </p>
              <p className="mt-4 font-dm-sans text-sm leading-6 text-[#F4EDE9]/85">
                Te ayudamos a elegir aroma, tamaño y presentación. Respuesta
                el mismo día en horario de taller.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar a Aroma mediante WhatsApp"
                className="group flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-[2px] bg-[#F4EDE9] px-5 py-3.5 font-dm-sans text-xs font-semibold uppercase tracking-[0.18em] text-hard-brown transition-colors duration-200 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Contactar por WhatsApp
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>

              <Link
                href={ROUTES.COLECCION}
                className="group flex w-full items-center justify-between border-t border-[#F4EDE9]/40 pt-4 font-dm-sans text-[0.7rem] uppercase tracking-[0.2em] text-[#F4EDE9] transition-opacity duration-200 hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                O explorar la colección
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>

              <p className="pt-1 text-center font-dm-sans text-[0.65rem] uppercase tracking-[0.18em] text-[#F4EDE9]/70">
                Lun–Sáb · 9–19h · Lima
              </p>
            </div>
          </aside>
        </div>

        {/* Tira inferior */}
        <footer className="grid grid-cols-2 border-t border-hard-brown font-dm-sans text-[0.62rem] uppercase tracking-[0.2em] md:grid-cols-4">
          <span className="border-r border-hard-brown px-5 py-3">Cera de alta calidad</span>
          <span className="px-5 py-3 md:border-r md:border-hard-brown">Vertido a mano</span>
          <span className="border-r border-t border-hard-brown px-5 py-3 md:border-t-0">Aroma que perdura</span>
          <span className="border-t border-hard-brown px-5 py-3 md:border-t-0">N.º 04 / 04</span>
        </footer>
      </div>
    </section>
  );
}