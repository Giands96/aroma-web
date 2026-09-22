import Image from "next/image";

interface CollectionHeroProps {
  imageSrc?: string;
  title?: string;
  description?: string;
}

export default function CollectionHero({
  imageSrc = "/images/coleccion/hero.jpg",
  title = "Nuestra colección",
  description = "Piezas artesanales creadas para acompañarte en tus mejores momentos.",
}: CollectionHeroProps) {
  return (
    <section
      aria-labelledby="collection-hero-title"
      className="
        relative isolate min-h-full h-svh overflow-hidden
         border-white/40 text-white
      "
    >
      {/* Imagen principal */}
      <Image
        src={imageSrc}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-30 object-cover object-center"
      />

      {/* Oscurecimiento general muy sutil */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 bg-black/10" />

      {/* Degradado inferior para proteger la lectura */}
      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.04)_42%,rgba(0,0,0,0.72)_100%)]
        "
      />

      <div
        className="
          px-6 flex min-h-full w-full 
          flex-col 
          sm:px-8 sm:pb-8
          h-svh
          lg:px-12 lg:pb-10
        "
      >
        {/* Contenido inferior */}
        <div
          className="animate-hero-fade-in flex md:flex-row flex-col items-end h-svh gap-10 py-10 md:justify-normal justify-end  lg:gap-8 lg:py-14
          "
        >
          {/* Título */}
          <div className="md:col-span-9">
            <span
              className="
                mb-4 block font-dm-sans
                text-[0.6rem] uppercase
                tracking-[0.22em]
                sm:text-xs
              "
            >
              Velas artesanales
            </span>

            <h1
              id="collection-hero-title"
              className="
                max-w-[11ch] text-balance
                font-mileast
                text-[clamp(3.7rem,14vw,10rem)]
                font-normal leading-[0.78]
                tracking-[-0.055em]
              "
            >
              {title}
            </h1>
          </div>

          {/* Descripción */}
          <div
            className="
              border-t border-white/60 pt-5
              md:border-l md:border-t-0
              md:pl-6 md:pt-0 h-full max-h-24
            "
          >
            <p
              className="
                max-w-sm font-dm-sans
                text-sm leading-6 text-white/90
                sm:text-base sm:leading-7 
              "
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}