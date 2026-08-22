import { describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getProductBySlug: vi.fn(),
  getPublicProductBySlug: vi.fn(),
  getWhatsAppConfig: vi.fn(),
  getPublicWhatsAppConfig: vi.fn(),
}));

vi.mock("@/app/shared/services/products.service", () => services);
vi.mock("@/app/shared/services/config.service", () => ({
  getWhatsAppConfig: services.getWhatsAppConfig,
  getPublicWhatsAppConfig: services.getPublicWhatsAppConfig,
}));
vi.mock(
  "@/app/shared/components/public/coleccion/ProductGallery",
  () => ({ default: () => null }),
);
vi.mock(
  "@/app/shared/components/public/coleccion/ProductPurchaseActions",
  () => ({ default: () => null }),
);
vi.mock("@/app/shared/lib/utils/product-images", () => ({
  getProductImages: () => [],
}));

import Page from "./page";

const product = {
  id: "product-id",
  slug: "vela-aurora",
  nombre: "Vela Aurora",
  descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
};

const whatsappConfig = {
  clave: "principal",
  telefono: "51945513054",
  mensaje_carrito: "Hola",
  mensaje_producto: "Hola por {producto_name}",
};

describe("product detail page", () => {
  it("loads product and WhatsApp configuration through the public cached readers", async () => {
    services.getPublicProductBySlug.mockResolvedValue(product);
    services.getPublicWhatsAppConfig.mockResolvedValue(whatsappConfig);

    await Page({ params: Promise.resolve({ slug: "vela-aurora" }) });

    expect(services.getPublicProductBySlug).toHaveBeenCalledWith("vela-aurora");
    expect(services.getPublicWhatsAppConfig).toHaveBeenCalledOnce();
    expect(services.getProductBySlug).not.toHaveBeenCalled();
    expect(services.getWhatsAppConfig).not.toHaveBeenCalled();
  });

  it("starts the WhatsApp request before awaiting the product response", async () => {
    let resolveProduct!: (value: typeof product) => void;
    services.getPublicProductBySlug.mockReturnValue(
      new Promise<typeof product>((resolve) => {
        resolveProduct = resolve;
      }),
    );
    services.getPublicWhatsAppConfig.mockResolvedValue(whatsappConfig);

    const render = Page({ params: Promise.resolve({ slug: "vela-aurora" }) });

    expect(services.getPublicWhatsAppConfig).toHaveBeenCalledOnce();

    resolveProduct(product);
    await render;
  });
});
