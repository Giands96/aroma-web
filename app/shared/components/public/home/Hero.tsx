'use client';

import Image from "next/image";
import Link from "next/link";
import { MoveRight } from "lucide-react";
import FoldText from '@/app/shared/components/ui/FoldText';

export default function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative min-h-svh overflow-hidden  text-white"
    >
      <Image
        src="/hero.png"
        alt=""
        fill
        preload
        sizes="100vw"
        className="-z-20 object-cover object-[center_45%]"
      />

      {/* Capa para asegurar contraste del texto */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-hard-brown/35"
      />

      <div className="px-6 flex min-h-svh w-full flex-col py-5 sm:px-8 sm:py-6 ">
        {/* Contenido principal */}
        <div className="grid flex-1 grid-cols-1 content-end gap-10 py-10 lg:grid-cols-12 lg:items-end lg:gap-8 lg:py-14">
          {/* Título */}
          <div className="lg:col-span-9">
            <h1>
            <FoldText
              text="Transformando"
              splitBy="char"
              hinge="top"
              trigger="mount"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize={96}
              fontWeight={500}
              color="#f7f2e8"
            />
            <br />
            <FoldText
              text="momentos"
              splitBy="char"
              hinge="top"
              trigger="mount"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize={80}
              fontWeight={500}
              color="#f7f2e8"
            />
            </h1>
          </div>

          {/* Descripción y CTA */}
          <div className="animate-fadeInUp flex flex-col justify-end lg:col-span-3 lg:border-l lg:border-white/60 lg:pl-7">
            <p className="max-w-sm font-dm-sans text-base leading-7 sm:text-lg">
              Velas artesanales creadas para iluminar y conservar tus momentos
              más especiales.
            </p>

            <Link
              href="/coleccion"
              className="group mt-8 flex w-full items-center justify-between border-t border-white/70 pt-4 font-dm-sans text-xs uppercase tracking-[0.18em] transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              Explorar colección
              <MoveRight
                aria-hidden="true"
                className="size-5 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}