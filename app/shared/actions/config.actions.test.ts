import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  updateWhatsAppConfig: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/config.service", () => ({
  PUBLIC_WHATSAPP_CONFIG_CACHE_TAG: "public-whatsapp-config",
  updateCartLimits: vi.fn(),
  updateWhatsAppConfig: mocks.updateWhatsAppConfig,
}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import { updateWhatsAppConfigAction } from "./config.actions";

const validInput = {
  telefono: "51945513054",
  mensaje_carrito: "Hola, quiero información sobre mi carrito.",
  mensaje_producto: "Hola, quiero información sobre {producto_name}.",
};

describe("config actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("revalidates the public WhatsApp configuration after updating it", async () => {
    mocks.updateWhatsAppConfig.mockResolvedValue({
      clave: "principal",
      ...validInput,
    });

    const result = await updateWhatsAppConfigAction(validInput);

    expect(result.data).toMatchObject(validInput);
    expect(mocks.revalidateTag).toHaveBeenCalledWith(
      "public-whatsapp-config",
      "max",
    );
  });

  it("does not revalidate the public configuration when the update fails", async () => {
    mocks.updateWhatsAppConfig.mockRejectedValue(new Error("database failure"));

    const result = await updateWhatsAppConfigAction(validInput);

    expect(result.serverError).toBeDefined();
    expect(mocks.revalidateTag).not.toHaveBeenCalled();
  });
});
