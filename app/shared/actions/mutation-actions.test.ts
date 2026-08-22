import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  updateCartLimits: vi.fn(),
  updateWhatsAppConfig: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/config.service", () => ({
  PUBLIC_WHATSAPP_CONFIG_CACHE_TAG: "public-whatsapp-config",
  updateCartLimits: mocks.updateCartLimits,
  updateWhatsAppConfig: mocks.updateWhatsAppConfig,
}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { updateCartLimitsAction, updateWhatsAppConfigAction } from "./config.actions";
describe("configuration actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("updates WhatsApp configuration only after the admin guard passes", async () => {
    const config = {
      telefono: "51945513054",
      mensaje_carrito: "Hola Aroma, quiero cotizar mi carrito:",
      mensaje_producto: "Hola Aroma, quiero consultar por {producto_name}.",
    };
    mocks.updateWhatsAppConfig.mockResolvedValue(config);

    const result = await updateWhatsAppConfigAction(config);

    expect(result.data).toEqual(config);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.updateWhatsAppConfig).toHaveBeenCalledWith(config);
  });

  it("updates cart limits only after the admin guard passes", async () => {
    const limits = { max_items: 10, max_quantity_per_item: 99 };
    mocks.updateCartLimits.mockResolvedValue(limits);

    const result = await updateCartLimitsAction(limits);

    expect(result.data).toEqual(limits);
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.updateCartLimits).toHaveBeenCalledWith(limits);
  });

});
