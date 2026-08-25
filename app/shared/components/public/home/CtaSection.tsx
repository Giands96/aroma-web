import Image from "next/image";
import { MoveUpRight } from "lucide-react";

interface AtmosphereSectionProps {
  whatsappHref: string;
}

export default function AtmosphereSection({
  whatsappHref,
}: AtmosphereSectionProps) {
  return (
    <section
      aria-labelledby="atmosphere-title"
      className="
        relative isolate min-h-[560px] overflow-hidden
        border-y border-white/50 bg-hard-brown text-white
        lg:min-h-[680px]
      "
    >
      {/* Imagen de fondo */}
      <Image
        src="/atmosfera-aroma.jpg"
        alt=""
        fill
        sizes="100vw"
        className="
          -z-30 object-cover object-[62%_center]
          sm:object-[58%_center]
          lg:object-center
        "
      />

      {/* Oscurecimiento general */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-black/20"
      />

      {/* Degradado direccional para conservar la fotografía */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.52)_38%,rgba(0,0,0,0.16)_70%,rgba(0,0,0,0.08)_100%)]
        "
      />

      <div
        className="
          mx-auto flex min-h-[560px] w-full max-w-[1600px]
          flex-col px-5
          sm:px-8
          lg:min-h-[680px] lg:px-12
        "
      >
        {/* Encabezado editorial */}

        {/* Contenido principal */}
        <div
          className="
            grid flex-1 grid-cols-1 content-end
            gap-10 py-10
            md:grid-cols-12 md:items-end
            lg:gap-8 lg:py-14
          "
        >
          {/* Título */}
          <div className="md:col-span-8 lg:col-span-9">

            <h2
              id="atmosphere-title"
              className="
                max-w-[10ch] text-balance
                font-mileast text-[clamp(3.5rem,7.5vw,8.5rem)]
                font-normal leading-[0.84]
                tracking-[-0.055em]
              "
            >
              Cuando la llama se enciende, el espacio cambia.
            </h2>
          </div>

          {/* Descripción y acción */}
          <div
            className="
              flex flex-col justify-end
              border-t border-white/50 pt-6
              md:col-span-4 md:border-l md:border-t-0
              md:pl-7 md:pt-0
              lg:col-span-3
            "
          >

            <p
              className="
                max-w-sm font-dm-sans text-base
                leading-7 text-white/90
                lg:text-lg lg:leading-8
              "
            >
              Aromas, luz y textura se unen para transformar cada espacio en
              una experiencia más íntima y personal.
            </p>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contactar a Aroma mediante WhatsApp"
              className="
                group mt-8 flex w-full items-center
                justify-between border-t border-white/70
                pt-4 font-dm-sans text-xs uppercase
                tracking-[0.18em]
                transition-opacity duration-300
                hover:opacity-70
                focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-white
              "
            >
              Contactar por WhatsApp

              <MoveUpRight
                aria-hidden="true"
                className="
                  size-5 transition-transform duration-300
                  group-hover:-translate-y-1
                  group-hover:translate-x-1
                "
              />
            </a>
          </div>
        </div>


      </div>
    </section>
  );
}