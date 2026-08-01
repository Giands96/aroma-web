import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createPack: vi.fn(),
  getPackById: vi.fn(),
  getProductById: vi.fn(),
  updatePack: vi.fn(),
  updateCartLimits: vi.fn(),
  updateWhatsAppConfig: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/packs.service", () => ({
  createPack: mocks.createPack,
  deletePack: vi.fn(),
  getPackById: mocks.getPackById,
  updatePack: mocks.updatePack,
}));
vi.mock("@/app/shared/services/products.service", () => ({
  getProductById: mocks.getProductById,
}));
vi.mock("@/app/shared/services/config.service", () => ({
  updateCartLimits: mocks.updateCartLimits,
  updateWhatsAppConfig: mocks.updateWhatsAppConfig,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { updateCartLimitsAction, updateWhatsAppConfigAction } from "./config.actions";
import { createPackAction, updatePackAction } from "./packs.actions";

const productId = "11111111-1111-4111-8111-111111111111";

describe("pack and configuration actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("revalidates the public product page after a pack is created", async () => {
    mocks.createPack.mockResolvedValue({ product_id: productId, cantidad: 6, precio: 84.9 });
    mocks.getProductById.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    const result = await createPackAction({
      product_id: productId,
      cantidad: 6,
      precio: 84.9,
    });

    expect(result.data).toMatchObject({ product_id: productId });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/coleccion/producto/vela-aurora");
  });

  it("updates WhatsApp configuration only after the admin guard passes", async () => {
    const config = {
      telefono: "51945513054",
      mensaje_base: "Hola Aroma, quiero consultar por:",
      mensaje_personalizado: "Hola Aroma, quiero un pedido personalizado!",
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

  it("does not reactivate a pack when an update omits activo", async () => {
    const packId = "22222222-2222-4222-8222-222222222222";
    mocks.getPackById.mockResolvedValue({ id: packId, product_id: productId, activo: false });
    mocks.getProductById.mockResolvedValue({ id: productId, slug: "vela-aurora" });
    mocks.updatePack.mockResolvedValue({ id: packId, product_id: productId });

    await updatePackAction({ id: packId, precio: 99.9 });

    expect(mocks.updatePack).toHaveBeenCalledWith(packId, { precio: 99.9 });
  });
});
