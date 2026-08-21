import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createFeaturedProduct: vi.fn(),
  deleteFeaturedProduct: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/products.service", () => ({
  createFeaturedProduct: mocks.createFeaturedProduct,
  deleteFeaturedProduct: mocks.deleteFeaturedProduct,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createFeaturedProductAction,
  deleteFeaturedProductAction,
} from "./featured-products.actions";

describe("featured product actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("adds a validated product after the admin guard and refreshes the dashboard", async () => {
    const productId = "11111111-1111-4111-8111-111111111111";

    const result = await createFeaturedProductAction({ productId });

    expect(result.data).toBeUndefined();
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.createFeaturedProduct).toHaveBeenCalledWith(productId);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/destacados");
  });

  it("removes a validated featured row after the admin guard and refreshes the dashboard", async () => {
    const result = await deleteFeaturedProductAction({ id: 1 });

    expect(result.data).toBeUndefined();
    expect(mocks.requireAdmin).toHaveBeenCalledOnce();
    expect(mocks.deleteFeaturedProduct).toHaveBeenCalledWith("1");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/dashboard/destacados");
  });

  it("rejects an invalid featured row id before calling the delete service", async () => {
    const result = await deleteFeaturedProductAction({ id: 0 });

    expect(result.validationErrors).toBeDefined();
    expect(mocks.deleteFeaturedProduct).not.toHaveBeenCalled();
  });

  it("does not create a featured product when the admin guard rejects", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("Unauthorized"));

    const result = await createFeaturedProductAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.serverError).toBeDefined();
    expect(mocks.createFeaturedProduct).not.toHaveBeenCalled();
  });

  it("logs a sanitized authorization diagnostic when the admin guard rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = Object.assign(new Error("Unauthorized"), {
      code: "42501",
      status: 403,
      digest: "AUTH_DIGEST",
      details: "Must not be logged",
    });
    mocks.requireAdmin.mockRejectedValue(error);

    await createFeaturedProductAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    expect(consoleError).toHaveBeenCalledWith("featured_product_create_failed", {
      stage: "authorization",
      name: "Error",
      code: "42501",
      status: 403,
      digest: "AUTH_DIGEST",
    });
    consoleError.mockRestore();
  });

  it("logs a sanitized service diagnostic when featured-product creation rejects", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const error = Object.assign(new Error("Database failure"), {
      name: "PostgrestError",
      code: "23505",
      status: 409,
      details: "Must not be logged",
    });
    mocks.createFeaturedProduct.mockRejectedValue(error);

    await createFeaturedProductAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    expect(consoleError).toHaveBeenCalledWith("featured_product_create_failed", {
      stage: "service",
      name: "PostgrestError",
      code: "23505",
      status: 409,
    });
    consoleError.mockRestore();
  });

  it("does not delete a featured product when the admin guard rejects", async () => {
    mocks.requireAdmin.mockRejectedValue(new Error("Unauthorized"));

    const result = await deleteFeaturedProductAction({ id: 1 });

    expect(result.serverError).toBeDefined();
    expect(mocks.deleteFeaturedProduct).not.toHaveBeenCalled();
  });
});
