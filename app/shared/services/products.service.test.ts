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
  createProduct,
  createProductWithPacks,
  getProductBySlug,
  getProducts,
  updateProduct,
  updateProductWithPacks,
} from "./products.service";

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

describe("products service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads only active products for the public catalog", async () => {
    const query = queryResult([]);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getProducts()).resolves.toEqual([]);
    expect(query.eq).toHaveBeenCalledWith("activo", true);
  });

  it("returns null when a public product slug does not exist", async () => {
    const query = queryResult(null, { code: "PGRST116" });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getProductBySlug("missing-product")).resolves.toBeNull();
  });

  it("inserts and returns a product", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const query = queryResult(product);
    const from = vi.fn(() => query);
    mocks.createAdminClient.mockReturnValue({ from });

    await expect(
      createProduct({
        nombre: "Vela Aurora",
        slug: "vela-aurora",
        descripcion: "Una vela artesanal para espacios cálidos.",
      })
    ).resolves.toEqual(product);
    expect(from).toHaveBeenCalledWith("products");
    expect(query.insert).toHaveBeenCalledOnce();
  });

  it("updates only the requested product", async () => {
    const query = queryResult({ id: "product-id", activo: false });
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    await updateProduct("product-id", { activo: false });
    expect(query.eq).toHaveBeenCalledWith("id", "product-id");
  });

  it("creates a product and packs through one database RPC", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: product, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      createProductWithPacks(
        {
          nombre: "Vela Aurora",
          slug: "vela-aurora",
          descripcion: "Una vela artesanal para espacios cálidos.",
        },
        [{ cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toEqual(product);
    expect(rpc).toHaveBeenCalledWith("create_product_with_packs", expect.any(Object));
  });

  it("updates a product and its packs through one database RPC", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: product, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      updateProductWithPacks(
        "product-id",
        { nombre: "Vela Aurora" },
        [{ id: "pack-id", cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toEqual(product);
    expect(rpc).toHaveBeenCalledWith("update_product_with_packs", expect.any(Object));
  });
});
