import { describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getProductsPage: vi.fn(),
  getPublicProductsPage: vi.fn(),
}));

vi.mock("@/app/shared/services/products.service", () => services);
vi.mock("@/app/shared/components/public/coleccion/CollectionHero", () => ({
  default: () => null,
}));
vi.mock("./../../shared/components/public/coleccion/ProductGrid", () => ({
  default: () => null,
}));
vi.mock("@public/collection-hero.png", () => ({
  default: { src: "/collection-hero.png" },
}));

import ColeccionPage from "./page";

describe("ColeccionPage", () => {
  it("loads public catalog data without the session-bound reader", async () => {
    services.getPublicProductsPage.mockResolvedValue({ products: [], total: 0 });

    await ColeccionPage({ searchParams: Promise.resolve({}) });

    expect(services.getPublicProductsPage).toHaveBeenCalledWith(1, 8);
    expect(services.getProductsPage).not.toHaveBeenCalled();
  });
});
