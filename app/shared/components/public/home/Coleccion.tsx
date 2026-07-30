import { MoveRight, UserRoundArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import ProductCard from "./Producto";

export default function ColeccionSection() {
    return (
      <section className="flex flex-col p-6 py-24 md:py-12 md:py-24 gap-3 bg-[#F4EDE9]">
        <header className="flex flex-col md:flex-row border-b border-hard-brown justify-normal md:gap-0 text-center md:text-left  md:justify-between items-center w-full gap-4">
          <h2 className="text-6xl md:text-8xl text-hard-brown">Colección</h2>
          <p className="font-dm-sans text-base xl:text-lg md:text-2xl lg:text-xl text-hard-brown">
            Piezas artesanales creadas para acompañarte en tus mejores momentos
          </p>
        </header>
        <div className="flex min-w-full justify-center md:justify-normal">
          <Link
            className="font-dm-sans text-xl  flex gap-2 text-hard-brown border-b border-hard-brown"
            href="/coleccion"
          >
            Ver colección <MoveRight />
          </Link>
        </div>
        <div className="flex flex-col">
          <ProductCard
            title="Vela Aurora"
            description="Una fragancia suave diseñada para crear espacios cálidos y tranquilos."
            imageSrc="/image.png"
            price={50.9}
            slug="vela-aurora"
          />
          <ProductCard
            title="Vela Aurora"
            description="Una fragancia suave diseñada para crear espacios cálidos y tranquilos."
            imageSrc="/image.png"
            price={50.9}
            slug="vela-aurora"
          />
          <ProductCard
            title="Vela Aurora"
            description="Una fragancia suave diseñada para crear espacios cálidos y tranquilos."
            imageSrc="/image.png"
            price={50.9}
            slug="vela-aurora"
          />
        </div>
      </section>
    );
}