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
  deleteProduct,
  getProductBySlug,
  getProducts,
  setProductImages,
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
    upsert: vi.fn(),
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
  query.upsert.mockReturnValue(query);
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
    mocks.createClient.mockResolvedValue({ from });

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

  it("stores the ordered product gallery in products.imagenes", async () => {
    const images = [
      {
        public_id: "aroma/products/front",
        secure_url: "https://res.cloudinary.com/example/front.jpg",
      },
    ];
    const product = { id: "product-id", imagenes: images };
    const query = queryResult(product);
    const from = vi.fn(() => query);
    mocks.createClient.mockResolvedValue({ from });

    await expect(setProductImages("product-id", images)).resolves.toEqual(product);
    expect(query.update).toHaveBeenCalledWith({
      imagenes: images,
      imagen_public_id: images[0].public_id,
      imagen_url: images[0].secure_url,
    });
    expect(query.eq).toHaveBeenCalledWith("id", "product-id");
  });

  it("deletes a product with the authenticated server client", async () => {
    const query = queryResult(null);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(deleteProduct("product-id")).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalledOnce();
    expect(query.eq).toHaveBeenCalledWith("id", "product-id");
  });

  it("updates a product through the authenticated products table", async () => {
    const product = { id: "product-id", activo: false };
    const query = queryResult(product);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await updateProduct("product-id", { activo: false });
    expect(query.update).toHaveBeenCalledWith({ activo: false });
    expect(query.eq).toHaveBeenCalledWith("id", "product-id");
  });

  it("creates a product and its options through authenticated tables", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const productQuery = queryResult(product);
    const optionsQuery = queryResult([
      { id: "option-id", product_id: "product-id", nombre: "Caja x6" },
    ]);
    const from = vi.fn((table: string) =>
      table === "products" ? productQuery : optionsQuery
    );
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      createProductWithOptions(
        {
          nombre: "Vela Aurora",
          slug: "vela-aurora",
          descripcion: "Una vela artesanal para espacios cálidos.",
        },
        [{ nombre: "Caja x6", cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toMatchObject(product);
    expect(productQuery.insert).toHaveBeenCalledOnce();
    expect(optionsQuery.insert).toHaveBeenCalledWith([
      {
        product_id: "product-id",
        nombre: "Caja x6",
        cantidad: 6,
        precio: 84.9,
        activo: true,
      },
    ]);
  });

  it("updates product options without an RPC", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const productQuery = queryResult(product);
    const existingOptionsQuery = queryResult([{ id: "option-id" }]);
    const optionsQuery = queryResult(null);
    let productOptionsCalls = 0;
    const from = vi.fn((table: string) => {
      if (table === "products") return productQuery;
      productOptionsCalls += 1;
      return productOptionsCalls === 1 ? existingOptionsQuery : optionsQuery;
    });
    mocks.createClient.mockResolvedValue({ from });

    await expect(
      updateProductWithOptions(
        "product-id",
        { nombre: "Vela Aurora" },
        [{ id: "option-id", nombre: "Caja x6", cantidad: 6, precio: 84.9, activo: true }]
      )
    ).resolves.toMatchObject(product);
    expect(productQuery.update).toHaveBeenCalledWith({ nombre: "Vela Aurora" });
    expect(optionsQuery.upsert).toHaveBeenCalledWith(
      [
        {
          id: "option-id",
          product_id: "product-id",
          nombre: "Caja x6",
          cantidad: 6,
          precio: 84.9,
          activo: true,
        },
      ],
      { onConflict: "id" }
    );
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
