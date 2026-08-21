import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getFeaturedProducts: vi.fn(),
  getThreeLastProducts: vi.fn(),
}));

vi.mock("@/app/shared/services/products.service", () => services);

import ColeccionSection from "./Coleccion";
import ProductCard from "./Producto";

const featuredProduct = {
  id: 1,
  created_at: "2026-08-21T00:00:00.000Z",
  product_id: "featured-product-id",
  posicion: 1,
  products: {
    slug: "vela-destacada",
    nombre: "Vela destacada",
    descripcion: "Una vela seleccionada para la colección.",
    imagen_public_id: "legacy-image",
    imagen_url: "https://example.com/legacy.jpg",
    imagenes: [
      {
        public_id: "gallery-image",
        secure_url: "https://example.com/gallery.jpg",
      },
    ],
    product_options: [{ precio: 42 }],
  },
};

const fallbackProduct = {
  id: "fallback-product-id",
  slug: "vela-reciente",
  nombre: "Vela reciente",
  descripcion: "Una vela disponible recientemente.",
  imagen_public_id: "legacy-fallback-image",
  imagen_url: "https://example.com/fallback.jpg",
  imagenes: null,
  activo: true,
  created_at: "2026-08-20T00:00:00.000Z",
  updated_at: "2026-08-20T00:00:00.000Z",
  product_options: [
    {
      id: "fallback-option-id",
      product_id: "fallback-product-id",
      nombre: "Única opción",
      cantidad: 1,
      precio: 35,
      activo: true,
    },
  ],
};

describe("ColeccionSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders configured featured products with normalized gallery images and first active-option prices", async () => {
    services.getFeaturedProducts.mockResolvedValue([featuredProduct]);

    const markup = renderToStaticMarkup(await ColeccionSection());

    expect(markup).toContain("Vela destacada");
    expect(markup).toContain('alt="Vela Vela destacada"');
    expect(markup).toContain("S/42");
    expect(markup).toContain("/producto/vela-destacada");
    expect(services.getThreeLastProducts).not.toHaveBeenCalled();
  });

  it("falls back to the last eligible products when no featured selection exists", async () => {
    services.getFeaturedProducts.mockResolvedValue([]);
    services.getThreeLastProducts.mockResolvedValue([fallbackProduct]);

    const markup = renderToStaticMarkup(await ColeccionSection());

    expect(services.getThreeLastProducts).toHaveBeenCalledOnce();
    expect(markup).toContain("Vela reciente");
    expect(markup).toContain('alt="Vela Vela reciente"');
    expect(markup).toContain("S/35");
  });

  it("falls back when configured featured rows cannot produce a card", async () => {
    services.getFeaturedProducts.mockResolvedValue([
      { ...featuredProduct, products: null },
      {
        ...featuredProduct,
        id: 2,
        products: { ...featuredProduct.products, product_options: [] },
      },
    ]);
    services.getThreeLastProducts.mockResolvedValue([fallbackProduct]);

    const markup = renderToStaticMarkup(await ColeccionSection());

    expect(services.getThreeLastProducts).toHaveBeenCalledOnce();
    expect(markup).toContain("Vela reciente");
    expect(markup).not.toContain("Vela destacada");
  });
});

describe("ProductCard", () => {
  it("renders an accessible placeholder when a product has no image", () => {
    const markup = renderToStaticMarkup(
      createElement(ProductCard, {
        title: "Vela sin imagen",
        description: "Una vela sin imagen disponible.",
        imageSrc: null,
        price: 25,
        slug: "vela-sin-imagen",
      }),
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain(
      'aria-label="Imagen no disponible para Vela sin imagen"',
    );
  });
});
