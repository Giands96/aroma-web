import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("@/app/shared/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
  createClient: mocks.createClient,
}));

import { createPack, getPackById, getPacksByProductId } from "./packs.service";

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
    then: (resolve: (value: unknown) => unknown) =>
      Promise.resolve({ data, error }).then(resolve),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.insert.mockReturnValue(query);
  query.update.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.single.mockResolvedValue({ data, error });
  return query;
}

describe("packs service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads active packs ordered by candle quantity", async () => {
    const query = queryResult([]);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await getPacksByProductId("product-id");
    expect(query.eq).toHaveBeenCalledWith("product_id", "product-id");
    expect(query.eq).toHaveBeenCalledWith("activo", true);
    expect(query.order).toHaveBeenCalledWith("cantidad", { ascending: true });
  });

  it("inserts a pack linked to its product", async () => {
    const pack = { id: "pack-id", product_id: "product-id", cantidad: 6, precio: 84.9 };
    const query = queryResult(pack);
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    await expect(
      createPack({ product_id: "product-id", cantidad: 6, precio: 84.9 })
    ).resolves.toEqual(pack);
  });

  it("returns null when a pack ID does not exist", async () => {
    const query = queryResult(null, { code: "PGRST116" });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getPackById("missing-pack")).resolves.toBeNull();
  });
});
