import { describe, expect, it, vi } from "vitest";

const services = vi.hoisted(() => ({
  getWhatsAppConfig: vi.fn(),
  getPublicWhatsAppConfig: vi.fn(),
}));

vi.mock("@/app/shared/services/config.service", () => ({
  getWhatsAppConfig: services.getWhatsAppConfig,
  getPublicWhatsAppConfig: services.getPublicWhatsAppConfig,
}));

vi.mock("./_components/CartView", () => ({ default: () => null }));

import Page from "./page";

const whatsappConfig = {
  clave: "principal",
  telefono: "51945513054",
  mensaje_carrito: "Hola, quiero cotizar mi carrito:",
  mensaje_producto: "Hola",
};

describe("cart page", () => {
  it("loads the WhatsApp configuration through the public cached reader", async () => {
    services.getPublicWhatsAppConfig.mockResolvedValue(whatsappConfig);

    await Page();

    expect(services.getPublicWhatsAppConfig).toHaveBeenCalledOnce();
    expect(services.getWhatsAppConfig).not.toHaveBeenCalled();
  });
});
