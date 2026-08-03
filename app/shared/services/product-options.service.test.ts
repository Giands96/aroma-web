import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/app/shared/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
  createClient: mocks.createClient,
}));

import {
  createProductOption,
  deleteProductOption,
  getAllProductOptionsByProductId,
  getProductOptionById,
  getProductOptionsByProductId,
  updateProductOption,
} from "./product-options.service";

function queryResult(data: unknown, error: unknown = null) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    single: vi.fn(),
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

describe("product options service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reads active options ordered by quantity", async () => {
    const query = queryResult([]);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getProductOptionsByProductId("product-id")).resolves.toEqual([]);
    expect(query.eq).toHaveBeenCalledWith("product_id", "product-id");
    expect(query.eq).toHaveBeenCalledWith("activo", true);
    expect(query.order).toHaveBeenCalledWith("cantidad", { ascending: true });
  });

  it("creates an administrator-defined option", async () => {
    const option = {
      id: "option-id",
      product_id: "product-id",
      nombre: "Caja x3",
      cantidad: 3,
      precio: 35,
      activo: true,
    };
    const query = queryResult(option);
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    await expect(
      createProductOption({
        product_id: "product-id",
        nombre: "Caja x3",
        cantidad: 3,
        precio: 35,
      })
    ).resolves.toEqual(option);
  });

  it("reads inactive options for administrative editing", async () => {
    const query = queryResult([]);
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await getAllProductOptionsByProductId("product-id");

    expect(query.eq).toHaveBeenCalledWith("product_id", "product-id");
    expect(query.eq).not.toHaveBeenCalledWith("activo", true);
  });

  it("returns null when an option does not exist", async () => {
    const query = queryResult(null, { code: "PGRST116" });
    mocks.createClient.mockResolvedValue({ from: vi.fn(() => query) });

    await expect(getProductOptionById("missing-option")).resolves.toBeNull();
  });

  it("updates and deletes through invariant-enforcing RPCs", async () => {
    const rpc = vi.fn(() => ({
      single: vi.fn().mockResolvedValue({
        data: { id: "option-id", nombre: "Caja x3", cantidad: 3, precio: 40 },
        error: null,
      }),
    }));
    mocks.createClient.mockResolvedValue({ rpc });

    await updateProductOption("option-id", { precio: 40 });
    await deleteProductOption("option-id");

    expect(rpc).toHaveBeenCalledWith("update_product_option", {
      option_data: { precio: 40 },
      target_option_id: "option-id",
    });
    expect(rpc).toHaveBeenCalledWith("delete_product_option", {
      target_option_id: "option-id",
    });
  });
});
