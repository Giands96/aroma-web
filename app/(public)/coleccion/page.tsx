import CollectionHero from "@/app/shared/components/public/coleccion/CollectionHero";
import Reveal from "@/app/shared/components/ui/Reveal";
import { redirect } from "next/navigation";
import HeroImage from "@public/collection-hero.png"
import ProductGrid from './../../shared/components/public/coleccion/ProductGrid';
import { getPublicProductsPage } from "@/app/shared/services/products.service";
import { ROUTES } from "@/app/shared/routes/routes";

const PRODUCTS_PER_PAGE = 8;

interface ColeccionPageProps {
    searchParams: Promise<{ page?: string | string[] }>;
}

export default async function ColeccionPage({ searchParams }: ColeccionPageProps) {
    const { page } = await searchParams;
    const requestedPage = typeof page === "string" ? Number(page) : 1;
    const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;
    const { products, total } = await getPublicProductsPage(currentPage, PRODUCTS_PER_PAGE);
    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));

    if (currentPage > totalPages) {
        redirect(ROUTES.COLECCION_PAGE(totalPages));
    }

    return (
        <main className="">
            <CollectionHero imageSrc={HeroImage.src}/>
            <section id="explora" className="w-full scroll-mt-20 bg-[#F4EDE9] text-hard-brown">
                <div className="w-full px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
                    <header className="grid grid-cols-1 gap-6 border-b border-hard-brown/60 pb-10 md:grid-cols-12 md:items-end lg:pb-12">
                        <div className="md:col-span-7 lg:col-span-8">
                            <p className="font-dm-sans text-[0.65rem] uppercase tracking-[0.24em] text-hard-brown/80">
                                Catálogo · Todas las piezas
                            </p>
                            <h2 className="mt-4 font-mileast text-[clamp(2.8rem,7vw,7.5rem)] font-normal uppercase leading-[0.85] tracking-[-0.05em]">
                                Explora
                            </h2>
                        </div>
                        <div className="md:col-span-5 lg:col-span-4">
                            <p className="max-w-md font-dm-sans text-sm leading-6 text-[#433227] lg:text-base lg:leading-7">
                                {total > 0
                                    ? `${total} ${total === 1 ? "pieza artesanal" : "piezas artesanales"} · Hecho a mano en Lima`
                                    : "Piezas artesanales · Hecho a mano en Lima"}
                            </p>
                        </div>
                    </header>
                    <ProductGrid
                        products={products}
                        currentPage={currentPage}
                        totalPages={totalPages}
                    />
                </div>
            </section>
        </main>
    )
}
