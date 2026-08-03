import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductOption: vi.fn(),
  deleteProductOption: vi.fn(),
  getProductById: vi.fn(),
  getProductOptionById: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  updateProductOption: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/app/shared/services/products.service", () => ({ getProductById: mocks.getProductById }));
vi.mock("@/app/shared/services/product-options.service", () => ({
  createProductOption: mocks.createProductOption,
  deleteProductOption: mocks.deleteProductOption,
  getProductOptionById: mocks.getProductOptionById,
  updateProductOption: mocks.updateProductOption,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  deleteProductOptionAction,
  updateProductOptionAction,
} from "./product-options.actions";

const productId = "11111111-1111-4111-8111-111111111111";
const optionId = "22222222-2222-4222-8222-222222222222";

describe("product option actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
    mocks.getProductById.mockResolvedValue({ id: productId, slug: "vela-aurora", activo: true });
  });

  it("rejects deactivating the last active option of an active product", async () => {
    mocks.getProductOptionById.mockResolvedValue({ id: optionId, product_id: productId, activo: true });
    mocks.updateProductOption.mockRejectedValue(new Error("An active product requires an active option"));

    const result = await updateProductOptionAction({ id: optionId, activo: false });

    expect(result.serverError).toBeDefined();
    expect(mocks.updateProductOption).toHaveBeenCalledWith(optionId, { activo: false });
  });

  it("rejects deleting the last active option of an active product", async () => {
    mocks.getProductOptionById.mockResolvedValue({ id: optionId, product_id: productId, activo: true });
    mocks.deleteProductOption.mockRejectedValue(new Error("An active product requires an active option"));

    const result = await deleteProductOptionAction({ id: optionId });

    expect(result.serverError).toBeDefined();
    expect(mocks.deleteProductOption).toHaveBeenCalledWith(optionId);
  });
});
