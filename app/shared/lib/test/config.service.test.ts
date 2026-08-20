import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/app/shared/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
  createClient: mocks.createClient,
}));

import {
  getCartLimits,
  getWhatsAppConfig,
  updateWhatsAppConfig,
} from "../../services/config.service";

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.upsert.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.single.mockResolvedValue({ data, error });
  query.maybeSingle.mockResolvedValue({ data, error });
  return query;
}

describe("config service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the WhatsApp singleton configuration", async () => {
    const config = {
      clave: "principal",
      telefono: "51945513054",
      mensaje_carrito: "Hola",
      mensaje_producto: "Hola por {producto_name}",
    };
    const query = queryResult(config);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getWhatsAppConfig()).resolves.toEqual(config);
    expect(query.eq).toHaveBeenCalledWith("clave", "principal");
  });

  it("reads the cart limits singleton configuration", async () => {
    const limits = { id: "00000000-0000-0000-0000-000000000001", max_items: 10 };
    const query = queryResult(limits);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getCartLimits()).resolves.toEqual(limits);
    expect(query.eq).toHaveBeenCalledWith("id", limits.id);
  });

  it("updates WhatsApp configuration with the authenticated server client", async () => {
    const config = {
      clave: "principal",
      telefono: "51945513054",
      mensaje_carrito: "Hola",
      mensaje_producto: "Hola por {producto_name}",
    };
    const query = queryResult(config);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(
      updateWhatsAppConfig({
        telefono: config.telefono,
        mensaje_carrito: config.mensaje_carrito,
        mensaje_producto: config.mensaje_producto,
      })
    ).resolves.toEqual(config);

    expect(query.upsert).toHaveBeenCalledWith(
      {
        clave: "principal",
        telefono: config.telefono,
        mensaje_carrito: config.mensaje_carrito,
        mensaje_producto: config.mensaje_producto,
      },
      { onConflict: "clave" }
    );
  });

  it("returns editable defaults when the WhatsApp singleton is missing", async () => {
    const query = queryResult(null);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getWhatsAppConfig()).resolves.toEqual({
      clave: "principal",
      telefono: "",
      mensaje_carrito: "Hola, quiero información sobre mi carrito.",
      mensaje_producto: "Hola, quiero información sobre {producto_name}.",
    });
  });

});
