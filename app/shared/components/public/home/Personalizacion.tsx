import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";

export default function PersonalizationSection() {
  return (
    <section
      aria-labelledby="personalization-title"
      className="w-full border-y border-hard-brown text-hard-brown bg-[#F4EDE9]"
    >
      <div className="px-6 max-w-full">
        {/* Encabezado editorial */}
        <header className="grid grid-cols-1 border-b border-hard-brown md:grid-cols-12">
          <div className="px-5 py-5 md:col-span-9 md:px-8 lg:px-12">
            <h2
              id="personalization-title"
              className="
                font-mileast text-[clamp(2.5rem,8vw,9rem)]
                font-normal uppercase leading-[0.78]
                tracking-[-0.055em] py-4
              "
            >
              Personalización
            </h2>
          </div>

          <div
            className="
              flex items-end justify-between border-t border-hard-brown
              px-5 py-4 font-dm-sans text-[0.65rem] uppercase
              tracking-[0.2em]
              md:col-span-3 md:flex-col md:items-start
              md:justify-between md:border-l md:border-t-0 md:px-6
            "
          >
          </div>
        </header>

        {/* Primer bloque */}
        <div className="grid grid-cols-1 border-b border-hard-brown md:grid-cols-12">
          {/* Imagen principal */}
          <figure
            className="
              relative min-h-[420px] overflow-hidden
              md:col-span-8 md:min-h-[650px]
              lg:col-span-9
            "
          >
            <Image
              src="/imagen-1-grid.jpg"
              alt="Vela personalizada junto a su empaque"
              fill
              priority
              sizes="(max-width: 767px) 100vw, 75vw"
              className="object-cover object-[center_45%]"
            />

            <figcaption
              className="
                absolute bottom-0 left-0 border-r border-t
                border-hard-brown bg-inherit px-4 py-3
                font-dm-sans text-[0.65rem] uppercase
                tracking-[0.16em]
              "
            >
              Colección personalizada · 2026
            </figcaption>
          </figure>

          {/* Información lateral */}
          <article
            className="
              flex min-h-[420px] flex-col justify-between
              border-t border-hard-brown p-6
              md:col-span-4 md:min-h-[650px]
              md:border-l md:border-t-0
              lg:col-span-3 lg:p-8
            "
          >
            <div className="flex items-start justify-between">
              <span
                className="
                  font-dm-sans text-[0.8rem] uppercase
                  tracking-[0.2em]
                "
              >
                Servicio
              </span>
            </div>

            <div>
              <p
                className="
                  max-w-xs font-mileast text-3xl leading-[1.05]
                  tracking-[-0.025em]
                  lg:text-4xl
                "
              >
                Diseñada para representar tus momentos.
              </p>

              <p
                className="
                  mt-6 max-w-sm font-dm-sans text-sm
                  leading-6 lg:text-base lg:leading-7
                "
              >
                Creamos velas personalizadas a partir de tu historia, el
                ambiente que deseas construir y los detalles que hacen único
                cada momento.
              </p>
            </div>

            <Link
              href="/personalizacion"
              className="
                group flex items-center justify-between
                border-t border-hard-brown pt-4
                font-dm-sans text-xs uppercase tracking-[0.18em]
              "
            >
              Descubrir el servicio

              <MoveRight
                aria-hidden="true"
                className="
                  size-5 transition-transform duration-300
                  group-hover:translate-x-1
                "
              />
            </Link>
          </article>
        </div>

        {/* Segundo bloque */}
        <div className="grid grid-cols-1 border-b border-hard-brown md:grid-cols-12">
          {/* Declaración editorial */}
          <article
            className="
              flex min-h-[430px] flex-col justify-between
              p-6 md:col-span-5 md:p-8
              lg:min-h-[580px] lg:p-12
            "
          >
            <span
              className="
                font-dm-sans text-[0.8rem] uppercase
                tracking-[0.22em]
              "
            >
              Nuestra filosofía
            </span>

            <p
              className="
                max-w-xl font-mileast
                text-[clamp(3rem,6vw,7rem)]
                leading-[0.86] tracking-[-0.05em]
              "
            >
              Tu historia,
              <br />
              convertida
              <br />
              en aroma.
            </p>

            <div className="flex items-end justify-between">
              <p className="max-w-[250px] font-dm-sans text-sm leading-5">
                Forma, fragancia y acabado construidos como una sola pieza.
              </p>
            </div>
          </article>

          {/* Imagen secundaria */}
          <figure
            className="
              relative min-h-[420px] overflow-hidden
              border-t border-hard-brown
              md:col-span-7 md:min-h-[580px]
              md:border-l md:border-t-0
            "
          >
            <Image
              src="/imagen-1-grid.jpg"
              alt="Velas personalizadas en una composición interior"
              fill
              sizes="(max-width: 767px) 100vw, 58vw"
              className="object-cover object-[center_55%]"
            />

            <div
              className="
                absolute right-0 top-0 border-b border-l
                border-hard-brown bg-inherit px-4 py-3
                font-dm-sans text-[0.65rem] uppercase
                tracking-[0.18em]
              "
            >
              Hecho a medida
            </div>
          </figure>
        </div>

        {/* Información inferior */}
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div
            className="
              grid grid-cols-1
              md:col-span-9 md:grid-cols-3
            "
          >
            <article className="border-b border-hard-brown p-6 md:border-b-0 md:border-r">

              <h3 className="mt-10 font-dm-sans text-sm font-semibold uppercase tracking-[0.18em]">
                Idea
              </h3>

              <p className="mt-4 max-w-xs font-dm-sans text-sm leading-6">
                Conversamos sobre el momento, concepto o identidad que deseas
                representar.
              </p>
            </article>

            <article className="border-b border-hard-brown p-6 md:border-b-0 md:border-r">

              <h3 className="mt-10 font-dm-sans text-sm font-semibold uppercase tracking-[0.18em]">
                Diseño
              </h3>

              <p className="mt-4 max-w-xs font-dm-sans text-sm leading-6">
                Seleccionamos fragancia, recipiente, color y presentación.
              </p>
            </article>

            <article className="border-b border-hard-brown p-6 md:border-b-0 md:border-r">

              <h3 className="mt-10 font-dm-sans text-sm font-semibold uppercase tracking-[0.18em]">
                Creación
              </h3>

              <p className="mt-4 max-w-xs font-dm-sans text-sm leading-6">
                Elaboramos cada pieza artesanalmente y cuidamos sus acabados.
              </p>
            </article>
          </div>

          {/* CTA */}
          <Link
            href="/personalizacion"
            className="
              group flex min-h-[270px] flex-col justify-between
              p-6 md:col-span-3 md:p-8
            "
          >
            <span
              className="
                font-dm-sans text-sm uppercase
                tracking-[0.2em]
              "
            >
              Iniciar proyecto
            </span>

            <div className="flex items-end justify-between">
              <span
                className="
                  max-w-[200px] font-mileast text-4xl
                  leading-none tracking-[-0.035em]
                "
              >
                Cuéntanos tu idea
              </span>

              <MoveRight
                aria-hidden="true"
                className="
                  size-10 transition-all duration-300
                  group-hover:translate-x-2 p-2 border rounded-full group-hover:bg-hard-brown group-hover:text-white 
                "
              />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}