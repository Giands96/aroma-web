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
  createProductWithOptions,
  getProductBySlug,
  getProducts,
  updateProduct,
  updateProductWithOptions,
} from "../../services/products.service";

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
    expect(query.select).toHaveBeenCalledWith("*, product_options!inner(*)");
    expect(query.eq).toHaveBeenCalledWith("product_options.activo", true);
    expect(query.order).toHaveBeenCalledWith("cantidad", {
      ascending: true,
      referencedTable: "product_options",
    });
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

  it("updates a product through the invariant-enforcing RPC", async () => {
    const product = { id: "product-id", activo: false };
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: product, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await updateProduct("product-id", { activo: false });
    expect(rpc).toHaveBeenCalledWith("update_product_with_options", {
      target_product_id: "product-id",
      product_data: { activo: false },
      option_data: null,
      image_upload_id: null,
    });
  });

  it("creates a product and options through one database RPC", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: product, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      createProductWithOptions(
        {
          nombre: "Vela Aurora",
          slug: "vela-aurora",
          descripcion: "Una vela artesanal para espacios cálidos.",
        },
        [{ nombre: "Caja x6", cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toEqual(product);
    expect(rpc).toHaveBeenCalledWith("create_product_with_options", expect.any(Object));
  });

  it("updates a product and its options through one database RPC", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: product, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      updateProductWithOptions(
        "product-id",
        { nombre: "Vela Aurora" },
        [{ id: "option-id", nombre: "Caja x6", cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toEqual(product);
    expect(rpc).toHaveBeenCalledWith("update_product_with_options", expect.any(Object));
  });

  it("rejects duplicate option IDs before invoking the update RPC", async () => {
    const rpc = vi.fn(() => ({ single: vi.fn().mockResolvedValue({ data: {}, error: null }) }));
    mocks.createClient.mockResolvedValue({ rpc });

    await expect(
      updateProductWithOptions(
        "product-id",
        {},
        [
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            nombre: "Unidad",
            cantidad: 1,
            precio: 12.5,
            activo: true,
          },
          {
            id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa".toUpperCase(),
            nombre: "Unidad",
            cantidad: 1,
            precio: 12.5,
            activo: false,
          },
        ]
      )
    ).rejects.toThrow("Duplicate product option IDs are not allowed");
    expect(rpc).not.toHaveBeenCalled();
  });
});
