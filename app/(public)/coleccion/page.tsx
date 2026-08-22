import CollectionHero from "@/app/shared/components/public/coleccion/CollectionHero";
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
            <section id="explora" className="w-full min-h-svh gap-12 h-full flex flex-col py-24 px-6 bg-[#F4EDE9]">
                <header className="flex flex-col gap-2">
                    <span className="font-dm-sans uppercase tracking-[2px]">Catálogo</span>
                    <h2 className="text-6xl text-hard-brown">Explora</h2>
                </header>
                <ProductGrid
                    products={products}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            </section>
        </main>
    )
}
