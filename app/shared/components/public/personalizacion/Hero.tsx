import Image from "next/image";

interface PersonalizacionHeroProps {
  title?: string;
}

export default function PersonalizacionHero({title = "Personalización"}: PersonalizacionHeroProps) {
  return (
    <section
      aria-labelledby="personalization-hero-title"
      className="
        min-h-svh w-full bg-[#FCFAF7]
        px-6 pb-10 pt-8
        text-hard-brown
        md:px-6 md:pb-14 md:pt-16
      "
    >
      <div
        className="
          mx-auto flex min-h-[calc(100svh-7rem)]
          w-full max-w-[1600px]
          flex-col items-center justify-center
          text-center
        "
      >
        {/* Contenido */}
        <div className="flex flex-col items-center">
          <span
            className="
              font-dm-sans text-[0.8rem]
              uppercase tracking-[0.3em]
              text-hard-brown/60 font-semibold
            "
          >
            Personalización artesanal
          </span>

          <h1 id="personalization-hero-title" className="
              mt-4 font-mileast
              text-[clamp(3.7rem,10vw,10rem)]
              font-normal leading-[0.82]
              tracking-[-0.055em]
            "
          >{title}
          </h1>

          <div aria-hidden="true" className="my-6 h-px w-24 bg-hard-brown/35" />

          <p
            className="
              max-w-[45ch] font-dm-sans
              text-base leading-7
              text-hard-brown/80
              md:text-xl md:leading-8
            "
          >
            Crea una vela única, diseñada a tu medida y pensada para convertir
            cada aroma en una expresión personal.
          </p>
        </div>

        {/* Imagen sin espacio flexible */}
        <figure className="mt-8 md:mt-10">
          <Image
            src="/VELA.webp"
            alt="Vela Aroma personalizada"
            width={700}
            height={700}
            sizes="(max-width: 767px) 72vw, 500px"
            className="
              h-auto w-[min(72vw,390px)]
              object-contain
              md:w-[min(42vw,500px)]
            "
          />
        </figure>
      </div>
    </section>
  );
}