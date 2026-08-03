import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/app/shared/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
  createClient: mocks.createClient,
}));

import { getCartLimits, getWhatsAppConfig } from "../../services/config.service";

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    update: vi.fn(),
    single: vi.fn(),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.single.mockResolvedValue({ data, error });
  return query;
}

describe("config service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the WhatsApp singleton configuration", async () => {
    const config = { id: "00000000-0000-0000-0000-000000000001", telefono: "51945513054" };
    const query = queryResult(config);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getWhatsAppConfig()).resolves.toEqual(config);
    expect(query.eq).toHaveBeenCalledWith("id", config.id);
  });

  it("reads the cart limits singleton configuration", async () => {
    const limits = { id: "00000000-0000-0000-0000-000000000001", max_items: 10 };
    const query = queryResult(limits);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getCartLimits()).resolves.toEqual(limits);
    expect(query.eq).toHaveBeenCalledWith("id", limits.id);
  });
});
