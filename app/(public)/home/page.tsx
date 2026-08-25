import ColeccionSection from "@/app/shared/components/public/home/Coleccion";
import Hero from "@/app/shared/components/public/home/Hero";
import Personalizacion from "@/app/shared/components/public/home/Personalizacion";
import React from "react";
import AtmosphereSection from './../../shared/components/public/home/CtaSection';

export default function HomePublic() {
    return (
      <main>
        <Hero />
        <ColeccionSection />
        <Personalizacion />
        <AtmosphereSection
          whatsappHref="https://wa.me/51944888171"
        />
      </main>
    );
} 