import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createPublicClient: vi.fn(),
  unstableCache: vi.fn((callback) => callback),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/app/shared/lib/supabase/server", () => ({
  createClient: mocks.createClient,
  createPublicClient: mocks.createPublicClient,
}));
vi.mock("next/cache", () => ({
  unstable_cache: mocks.unstableCache,
}));

import {
  createFeaturedProduct,
  deleteFeaturedProduct,
  getConfiguredFeaturedProducts,
  getFeaturedProducts,
  getPublicProductBySlug,
  getPublicProductsPage,
  getThreeLastProducts,
} from "./products.service";

interface QueryResponse {
  count?: number;
  data?: unknown;
  error?: unknown;
}

function queryResult({ count, data = null, error = null }: QueryResponse) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    gt: vi.fn(),
    lt: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.gt.mockReturnValue(query);
  query.lt.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.range.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.insert.mockResolvedValue({ error: null });
  query.update.mockReturnValue(query);
  query.delete.mockReturnValue(query);
  query.single.mockResolvedValue({ data, error });
  query.maybeSingle.mockResolvedValue({ data, error });

  Object.assign(query, {
    then: <T>(
      onfulfilled?: ((value: QueryResponse) => T | PromiseLike<T>) | null,
      onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null
    ) => Promise.resolve({ count, data, error }).then(onfulfilled, onrejected),
  });

  return query;
}

function deferredUpdateQuery() {
  let resolveQuery: ((value: QueryResponse) => void) | undefined;
  const query = {
    eq: vi.fn(),
    update: vi.fn(),
  };

  query.eq.mockReturnValue(query);
  query.update.mockReturnValue(query);

  Object.assign(query, {
    then: <T>(
      onfulfilled?: ((value: QueryResponse) => T | PromiseLike<T>) | null,
      onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null
    ) =>
      new Promise<QueryResponse>((resolve) => {
        resolveQuery = resolve;
      }).then(onfulfilled, onrejected),
  });

  return {
    query,
    resolve: () => resolveQuery?.({ data: null, error: null }),
  };
}

function mockClient(...queries: unknown[]) {
  const from = vi.fn(() => queries.shift());
  mocks.createClient.mockResolvedValue({ from });
  return from;
}

function mockPublicClient(...queries: unknown[]) {
  const from = vi.fn(() => queries.shift());
  mocks.createPublicClient.mockReturnValue({ from });
  return from;
}

describe("featured products service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a fourth featured product without inserting", async () => {
    const productQuery = queryResult({ data: { id: "product-id" } });
    const countQuery = queryResult({ count: 3 });
    mockClient(productQuery, countQuery);

    await expect(createFeaturedProduct("product-id")).rejects.toThrow("Máximo 3");
    expect(countQuery.insert).not.toHaveBeenCalled();
  });

  it("assigns the next available position when adding a featured product", async () => {
    const productQuery = queryResult({ data: { id: "product-id" } });
    const countQuery = queryResult({ count: 2 });
    const duplicateQuery = queryResult({ data: null });
    const insertQuery = queryResult({});
    mockClient(productQuery, countQuery, duplicateQuery, insertQuery);

    await createFeaturedProduct("product-id");

    expect(insertQuery.insert).toHaveBeenCalledWith({
      product_id: "product-id",
      posicion: 3,
    });
  });

  it("rejects a product that is already featured", async () => {
    const productQuery = queryResult({ data: { id: "product-id" } });
    const countQuery = queryResult({ count: 1 });
    const duplicateQuery = queryResult({ data: { id: 7 } });
    const insertQuery = queryResult({});
    mockClient(productQuery, countQuery, duplicateQuery, insertQuery);

    await expect(createFeaturedProduct("product-id")).rejects.toThrow(
      "El producto ya está destacado"
    );
    expect(insertQuery.insert).not.toHaveBeenCalled();
  });

  it("rejects an inactive product without creating a featured row", async () => {
    const productQuery = queryResult({ data: null });
    const insertQuery = queryResult({});
    const from = mockClient(productQuery, insertQuery);

    await expect(createFeaturedProduct("inactive-product-id")).rejects.toThrow(
      "Solo se pueden destacar productos activos"
    );

    expect(from).toHaveBeenCalledWith("products");
    expect(productQuery.eq).toHaveBeenCalledWith("id", "inactive-product-id");
    expect(productQuery.eq).toHaveBeenCalledWith("activo", true);
    expect(productQuery.maybeSingle).toHaveBeenCalledOnce();
    expect(insertQuery.insert).not.toHaveBeenCalled();
  });

  it("rejects a product without an active option before creating a featured row", async () => {
    const productQuery = queryResult({ data: null });
    const insertQuery = queryResult({});
    mockClient(productQuery, insertQuery);

    await expect(createFeaturedProduct("product-without-active-option")).rejects.toThrow(
      "al menos una opción activa"
    );

    expect(productQuery.select).toHaveBeenCalledWith(
      expect.stringContaining("product_options!inner(id)")
    );
    expect(productQuery.eq).toHaveBeenCalledWith("product_options.activo", true);
    expect(insertQuery.insert).not.toHaveBeenCalled();
  });

  it("rejects deleting the final featured product", async () => {
    const countQuery = queryResult({ count: 1 });
    const targetQuery = queryResult({ data: { posicion: 1 } });
    mockClient(countQuery, targetQuery);

    await expect(deleteFeaturedProduct("featured-id")).rejects.toThrow(
      "Debe existir al menos un producto destacado"
    );
    expect(countQuery.delete).not.toHaveBeenCalled();
  });

  it("compacts following positions after deleting a featured product", async () => {
    const countQuery = queryResult({
      count: 3,
      data: [
        { id: "second-featured-id", posicion: 2 },
        { id: "third-featured-id", posicion: 3 },
      ],
    });
    const targetQuery = queryResult({ data: { posicion: 1 } });
    const deleteQuery = queryResult({});
    const followingQuery = queryResult({
      data: [
        { id: "second-featured-id", posicion: 2 },
        { id: "third-featured-id", posicion: 3 },
      ],
    });
    const firstUpdateQuery = queryResult({});
    const secondUpdateQuery = queryResult({});
    mockClient(
      countQuery,
      targetQuery,
      deleteQuery,
      followingQuery,
      firstUpdateQuery,
      secondUpdateQuery
    );

    await deleteFeaturedProduct("first-featured-id");

    expect(deleteQuery.delete).toHaveBeenCalledOnce();
    expect(deleteQuery.eq).toHaveBeenCalledWith("id", "first-featured-id");
    expect(followingQuery.gt).toHaveBeenCalledWith("posicion", 1);
    expect(followingQuery.order).toHaveBeenCalledWith("posicion", { ascending: true });
    expect(firstUpdateQuery.update).toHaveBeenCalledWith({ posicion: 1 });
    expect(firstUpdateQuery.eq).toHaveBeenCalledWith("id", "second-featured-id");
    expect(secondUpdateQuery.update).toHaveBeenCalledWith({ posicion: 2 });
    expect(secondUpdateQuery.eq).toHaveBeenCalledWith("id", "third-featured-id");
  });

  it("starts all featured-position updates before waiting for a response", async () => {
    const countQuery = queryResult({ count: 3 });
    const targetQuery = queryResult({ data: { posicion: 1 } });
    const deleteQuery = queryResult({});
    const followingQuery = queryResult({
      data: [
        { id: "second-featured-id", posicion: 2 },
        { id: "third-featured-id", posicion: 3 },
      ],
    });
    const firstUpdate = deferredUpdateQuery();
    const secondUpdate = deferredUpdateQuery();
    mockClient(
      countQuery,
      targetQuery,
      deleteQuery,
      followingQuery,
      firstUpdate.query,
      secondUpdate.query
    );

    const result = deleteFeaturedProduct("first-featured-id");

    try {
      await vi.waitFor(() => {
        expect(firstUpdate.query.update).toHaveBeenCalledOnce();
      });
      expect(secondUpdate.query.update).toHaveBeenCalledOnce();
    } finally {
      firstUpdate.resolve();
      await new Promise((resolve) => setTimeout(resolve, 0));
      secondUpdate.resolve();
      await result;
    }
  });

  it("reads only active, purchasable products in featured position order", async () => {
    const query = queryResult({ data: [] });
    mockClient(query);

    await expect(getFeaturedProducts()).resolves.toEqual([]);

    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("products!inner(")
    );
    expect(query.select).toHaveBeenCalledWith(expect.stringContaining("imagenes"));
    expect(query.eq).toHaveBeenCalledWith("products.activo", true);
    expect(query.eq).toHaveBeenCalledWith("products.product_options.activo", true);
    expect(query.order).toHaveBeenCalledWith("posicion", { ascending: true });
    expect(query.order).toHaveBeenCalledWith("cantidad", {
      ascending: true,
      referencedTable: "products.product_options",
    });
    expect(query.limit).toHaveBeenCalledWith(3);
  });

  it("reads every configured featured row for dashboard removal controls", async () => {
    const query = queryResult({ data: [] });
    mockClient(query);

    await expect(getConfiguredFeaturedProducts()).resolves.toEqual([]);

    expect(query.select).toHaveBeenCalledWith(
      expect.stringContaining("products(")
    );
    expect(query.eq).not.toHaveBeenCalled();
    expect(query.order).toHaveBeenCalledWith("posicion", { ascending: true });
  });
});

describe("latest eligible products service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("limits the three newest eligible parent products before ordering their options", async () => {
    const query = queryResult({ data: [] });
    mockClient(query);

    await expect(getThreeLastProducts()).resolves.toEqual([]);

    expect(query.eq).toHaveBeenCalledWith("activo", true);
    expect(query.eq).toHaveBeenCalledWith("product_options.activo", true);
    expect(query.order).toHaveBeenNthCalledWith(1, "created_at", {
      ascending: false,
    });
    expect(query.order).toHaveBeenNthCalledWith(2, "cantidad", {
      ascending: true,
      referencedTable: "product_options",
    });
    expect(query.limit).toHaveBeenCalledWith(3);
  });
});

describe("public catalog service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads the catalog through the cookie-free client", async () => {
    const query = queryResult({ count: 0, data: [] });
    const from = mockPublicClient(query);

    await expect(getPublicProductsPage(1, 8)).resolves.toEqual({
      products: [],
      total: 0,
    });

    expect(mocks.createPublicClient).toHaveBeenCalledOnce();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith("products");
    expect(query.range).toHaveBeenCalledWith(0, 7);
  });

  it("caches public catalog reads for five minutes with the products tag", async () => {
    vi.resetModules();

    await import("./products.service");

    expect(mocks.unstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      ["public-products-page"],
      {
        revalidate: 300,
        tags: ["public-products"],
      },
    );
  });

  it("reads a public product detail through the cookie-free client", async () => {
    const product = { id: "product-id", slug: "vela-aurora" };
    const query = queryResult({ data: product });
    const from = mockPublicClient(query);

    await expect(getPublicProductBySlug("vela-aurora")).resolves.toEqual(product);

    expect(mocks.createPublicClient).toHaveBeenCalledOnce();
    expect(mocks.createClient).not.toHaveBeenCalled();
    expect(from).toHaveBeenCalledWith("products");
    expect(query.eq).toHaveBeenCalledWith("slug", "vela-aurora");
  });

  it("caches public product detail reads with the products tag", async () => {
    vi.resetModules();

    await import("./products.service");

    expect(mocks.unstableCache).toHaveBeenCalledWith(
      expect.any(Function),
      ["public-product-detail"],
      {
        revalidate: 300,
        tags: ["public-products"],
      },
    );
  });
});
