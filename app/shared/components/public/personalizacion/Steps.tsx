import Image from "next/image";
import { Rose } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  imageSrc: string;
  imagePosition?: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Elige tu aroma",
    description:
      "Selecciona la fragancia que mejor represente tu estilo, espacio o momento especial.",
    imageSrc: "/1.jpg",
    imagePosition: "center",
  },
  {
    number: 2,
    title: "Personaliza tu diseño",
    description:
      "Define el color, la forma y el tamaño para crear una pieza verdaderamente única.",
    imageSrc: "/2.jpg",
    imagePosition: "center",
  },
  {
    number: 3,
    title: "Cuéntanos la ocasión",
    description:
      "Comparte con nosotros la historia detrás de tu vela y te orientaremos en cada detalle.",
    imageSrc: "/3.jpg",
    imagePosition: "center",
  },
];

export default function PersonalizacionPasos() {
  return (
    <section
      aria-labelledby="personalization-process-title"
      className="w-full border-y border-white/30 bg-hard-brown text-white"
    >
      {/* Encabezado editorial */}
      <header className="grid grid-cols-1 border-b border-white/30 md:grid-cols-12">
        <div className="px-6 py-12 md:col-span-9 md:px-10 lg:px-14 lg:py-16">
          <div className="mb-8 flex items-center gap-3">
            <Rose
              aria-hidden="true"
              strokeWidth={1.2}
              className="size-4 text-white/70"
            />

            <span className="font-dm-sans text-[0.65rem] uppercase tracking-[0.24em] text-white/70">
              Proceso de personalización
            </span>
          </div>

          <h2
            id="personalization-process-title"
            className="max-w-[12ch] font-mileast text-[clamp(3.5rem,7vw,8rem)] font-normal leading-[0.82] tracking-[-0.055em]"
          >
            Así creamos tu vela ideal
          </h2>
        </div>

        <div className="flex items-end justify-between border-t border-white/30 px-6 py-6 font-dm-sans text-[0.65rem] uppercase tracking-[0.2em] text-white/70 md:col-span-3 md:flex-col md:items-start md:border-l md:border-t-0 md:px-8 md:py-10">
          <span>Hecho a medida</span>
          <span>03 pasos</span>
        </div>
      </header>

      {/* Pasos */}
      <ol className="grid auto-rows-fr grid-cols-1 items-stretch md:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.number}
            className="
              group relative isolate flex h-full min-w-0
              flex-col overflow-hidden
              border-b border-white/30
              md:border-b-0 md:border-r
              md:last:border-r-0
            "
          >
            {/* Imagen de fondo */}
            <Image
              src={step.imageSrc}
              alt=""
              fill
              sizes="(max-width: 767px) 100vw, 33vw"
              className="-z-30 object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.025]"
              style={{
                objectPosition: step.imagePosition ?? "center",
              }}
            />

            {/* Oscurecimiento general */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-hard-brown/60"
            />

            {/* Degradado para proteger el contenido inferior */}
            <div
              aria-hidden="true"
              className="
                absolute inset-0 -z-10
                bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.2)_40%,rgba(0,0,0,0.75)_100%)]
              "
            />

            {/* Número superior */}
            <div className="flex items-start justify-between px-6 py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
              <span className="font-mileast text-5xl leading-none text-white lg:text-6xl">
                {String(step.number).padStart(2, "0")}
              </span>

              <span className="font-dm-sans text-[0.6rem] uppercase tracking-[0.18em] text-white/70">
                Paso
              </span>
            </div>

            {/* Espacio flexible */}
            <div aria-hidden="true" className="flex-1 py-12 md:py-16" />

            {/* Contenido inferior */}
            <div className="mt-auto px-6 pb-8 md:px-8 md:pb-10 lg:px-10 lg:pb-12">
              <div
                aria-hidden="true"
                className="mb-7 h-px w-full origin-left bg-white/50 transition-transform duration-500 group-hover:scale-x-90"
              />

              <h3 className="max-w-[12ch] min-h-17.5 max-h-18 font-mileast text-3xl leading-[0.95] tracking-[-0.03em] lg:text-4xl">
                {step.title}
              </h3>

              <p className="mt-6 max-w-sm font-dm-sans text-sm leading-7 text-white/80 lg:text-base">
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}