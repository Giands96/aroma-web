import CollectionHero from "@/app/shared/components/public/coleccion/CollectionHero";
import { redirect } from "next/navigation";
import HeroImage from "@public/collection-hero.png"
import ProductGrid from './../../shared/components/public/coleccion/ProductGrid';
import { getProductsPage } from "@/app/shared/services/products.service";
import type { Product } from "@/app/shared/types/product.types";
import ImagenMock from "@public/image.png"

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
    const { products, total } = await getProductsPage(currentPage, PRODUCTS_PER_PAGE);
    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE));

    if (currentPage > totalPages) {
        redirect(`/coleccion?page=${totalPages}`);
    }

    const mockProducts: Product[] = [
        {
            id: "1",
            slug: "producto-1",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "1",
                    product_id: "1",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "2",
            slug: "producto-2",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "2",
                    product_id: "2",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "3",
            slug: "producto-2",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "3",
                    product_id: "3",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "4",
            slug: "producto-4",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "4",
                    product_id: "2",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "5",
            slug: "producto-2",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "5",
                    product_id: "5",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "6",
            slug: "producto-6",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "6",
                    product_id: "6",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "7",
            slug: "producto-6",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "6",
                    product_id: "6",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        },
        {
            id: "8",
            slug: "producto-6",
            nombre: "Vela Aromática",
            descripcion: "Descripción del producto 1",
            imagen_public_id: null,
            imagen_url: ImagenMock.src,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            product_options: [
                {
                    id: "6",
                    product_id: "6",
                    nombre: "Opción 1",
                    precio: 10.99,
                    cantidad: 100,
                    activo: true,
                },
            ],
        }
        
    ]


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
