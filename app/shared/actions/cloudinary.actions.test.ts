import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  clearProductImage: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
  getProductById: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/cloudinary.service", () => ({
  deleteImageFromCloudinary: mocks.deleteImageFromCloudinary,
  uploadImageToCloudinary: vi.fn(),
}));
vi.mock("@/app/shared/services/products.service", () => ({
  clearProductImage: mocks.clearProductImage,
  getProductById: mocks.getProductById,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { deleteProductImageAction } from "./cloudinary.actions";

describe("deleteProductImageAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("deletes only the image public ID resolved from the requested product", async () => {
    mocks.getProductById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      imagen_public_id: "aroma/products/vela-aurora",
    });
    mocks.clearProductImage.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      slug: "vela-aurora",
    });

    const result = await deleteProductImageAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.data).toBeUndefined();
    expect(mocks.clearProductImage).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "aroma/products/vela-aurora"
    );
    expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledWith(
      "aroma/products/vela-aurora"
    );
  });
});
