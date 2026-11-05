import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createPublicClient: vi.fn(),
  unstableCache: vi.fn((callback: unknown) => callback),
  unstableRethrow: vi.fn(),
}));

const snapshot = vi.hoisted(() => {
  function product(id: string, slug: string) {
    return {
      id,
      slug,
      nombre: slug,
      descripcion: `${slug} description`,
      imagen_public_id: null,
      imagen_url: null,
      activo: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      product_options: [
        {
          id: `${id}-option`,
          product_id: id,
          nombre: "Unidad",
          cantidad: 1,
          precio: 10,
          activo: true,
        },
      ],
    };
  }

  return {
    products: [
      product("product-1", "vela-aurora"),
      product("product-2", "vela-bosque"),
      product("product-3", "vela-costa"),
    ],
    featuredProducts: [
      {
        id: 1,
        created_at: "2026-01-01T00:00:00.000Z",
        product_id: "product-1",
        posicion: 1,
        products: {
          slug: "vela-aurora",
          nombre: "vela-aurora",
          descripcion: "vela-aurora description",
          imagen_public_id: null,
          imagen_url: null,
          imagenes: [],
          product_options: [{ precio: 10 }],
        },
      },
    ],
    whatsappConfig: {
      clave: "principal",
      telefono: "51974137694",
      mensaje_carrito: "Hola, quiero información sobre mi carrito.",
      mensaje_producto: "Hola, quiero información sobre {producto_name}.",
    },
  };
});

vi.mock("server-only", () => ({}));
vi.mock("@/app/shared/lib/supabase/server", () => ({
  createClient: mocks.createClient,
  createPublicClient: mocks.createPublicClient,
}));
vi.mock("next/cache", () => ({
  unstable_cache: mocks.unstableCache,
}));
vi.mock("next/navigation", () => ({
  unstable_rethrow: mocks.unstableRethrow,
}));
vi.mock("@/data/catalog.snapshot.json", () => ({
  default: {
    version: 1,
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...snapshot,
  },
}));

import { getPublicWhatsAppConfig } from "../../services/config.service";
import {
  getFeaturedProducts,
  getPublicProductBySlug,
  getPublicProductsPage,
  getThreeLastProducts,
} from "../../services/products.service";

function failingQuery() {
  const error = { message: "TypeError: fetch failed" };
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.range.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.single.mockResolvedValue({ data: null, error });
  query.maybeSingle.mockResolvedValue({ data: null, error });

  Object.assign(query, {
    then: (
      onfulfilled?: ((value: unknown) => unknown) | null,
      onrejected?: ((reason: unknown) => unknown) | null,
    ) =>
      Promise.resolve({ count: null, data: null, error }).then(
        onfulfilled,
        onrejected,
      ),
  });

  return query;
}

function mockFailingPublicClient() {
  const query = failingQuery();
  mocks.createPublicClient.mockReturnValue({ from: vi.fn(() => query) });
}

function mockFailingCookieClient() {
  const query = failingQuery();
  mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });
}

describe("public catalog fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("serves the current page from the snapshot when the catalog query fails", async () => {
    mockFailingPublicClient();

    await expect(getPublicProductsPage(1, 2)).resolves.toEqual({
      products: [snapshot.products[0], snapshot.products[1]],
      total: 3,
    });
  });

  it("paginates the snapshot in memory for later pages", async () => {
    mockFailingPublicClient();

    await expect(getPublicProductsPage(2, 2)).resolves.toEqual({
      products: [snapshot.products[2]],
      total: 3,
    });
  });

  it("serves a known product detail from the snapshot", async () => {
    mockFailingPublicClient();

    await expect(getPublicProductBySlug("vela-bosque")).resolves.toEqual(
      snapshot.products[1],
    );
  });

  it("returns null for an unknown slug while the database is down", async () => {
    mockFailingPublicClient();

    await expect(getPublicProductBySlug("missing-product")).resolves.toBeNull();
  });

  it("serves the latest products from the snapshot", async () => {
    mockFailingCookieClient();

    await expect(getThreeLastProducts()).resolves.toEqual(snapshot.products);
  });

  it("serves featured products from the snapshot", async () => {
    mockFailingCookieClient();

    await expect(getFeaturedProducts()).resolves.toEqual(
      snapshot.featuredProducts,
    );
  });

  it("serves the WhatsApp configuration from the snapshot", async () => {
    mockFailingPublicClient();

    await expect(getPublicWhatsAppConfig()).resolves.toEqual(
      snapshot.whatsappConfig,
    );
  });

  it("logs every fallback without throwing", async () => {
    mockFailingPublicClient();

    await expect(getPublicProductsPage(1, 8)).resolves.toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      "public_catalog_fallback",
      expect.objectContaining({ scope: "public-products-page" }),
    );
  });

  it("rethrows Next.js control-flow errors instead of treating them as outages", async () => {
    mockFailingPublicClient();
    const dynamicError = Object.assign(new Error("Dynamic server usage"), {
      digest: "DYNAMIC_SERVER_USAGE",
    });
    mocks.unstableRethrow.mockImplementationOnce(() => {
      throw dynamicError;
    });

    await expect(getPublicProductsPage(1, 8)).rejects.toBe(dynamicError);
  });
});
