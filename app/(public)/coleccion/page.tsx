import CollectionHero from "@/app/shared/components/public/coleccion/CollectionHero";
import React from "react";
import HeroImage from "@public/collection-hero.png"
import ProductGrid from './../../shared/components/public/coleccion/ProductGrid';

export default function ColeccionPage() {
    return (
        <main className="">
            <CollectionHero imageSrc={HeroImage.src}/>
            <section id="explora" className="w-full min-h-svh gap-12 h-full flex flex-col py-24 px-6 bg-[#F4EDE9]">
                <header className="flex flex-col gap-2">
                    <span className="font-dm-sans uppercase tracking-[2px]">Catálogo</span>
                    <h2 className="text-6xl text-hard-brown">Explora</h2>
                </header>
                <ProductGrid/>
            </section>
        </main>
    )
}