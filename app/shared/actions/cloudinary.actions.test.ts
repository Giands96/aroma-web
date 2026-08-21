import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
  getProductById: vi.fn(),
  revalidatePath: vi.fn(),
  setProductImages: vi.fn(),
  uploadImageToCloudinary: vi.fn(),
  validateImageFile: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/cloudinary.service", () => ({
  deleteImageFromCloudinary: mocks.deleteImageFromCloudinary,
  uploadImageToCloudinary: mocks.uploadImageToCloudinary,
}));
vi.mock("@/app/shared/lib/validations/image.schema", () => ({
  validateImageFile: mocks.validateImageFile,
}));
vi.mock("@/app/shared/services/products.service", () => ({
  getProductById: mocks.getProductById,
  setProductImages: mocks.setProductImages,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  deleteProductImageAction,
  uploadProductImageAction,
} from "./cloudinary.actions";

describe("deleteProductImageAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("deletes only the image public ID resolved from the requested product", async () => {
    mocks.getProductById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      imagen_public_id: "aroma/products/vela-aurora",
      imagen_url: "https://res.cloudinary.com/example/vela-aurora.jpg",
      imagenes: [],
    });
    mocks.setProductImages.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      slug: "vela-aurora",
    });

    const result = await deleteProductImageAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    expect(result.data).toBeUndefined();
    expect(mocks.setProductImages).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      []
    );
    expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledWith(
      "aroma/products/vela-aurora"
    );
  });

  it("starts independent Cloudinary deletions together", async () => {
    const resolvers: Array<() => void> = [];
    mocks.getProductById.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      slug: "vela-aurora",
      imagenes: [
        {
          public_id: "aroma/products/vela-aurora-front",
          secure_url: "https://res.cloudinary.com/example/vela-aurora-front.jpg",
        },
        {
          public_id: "aroma/products/vela-aurora-back",
          secure_url: "https://res.cloudinary.com/example/vela-aurora-back.jpg",
        },
      ],
    });
    mocks.setProductImages.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
      slug: "vela-aurora",
    });
    mocks.deleteImageFromCloudinary.mockImplementation(
      () => new Promise<void>((resolve) => resolvers.push(resolve))
    );

    const result = deleteProductImageAction({
      productId: "11111111-1111-4111-8111-111111111111",
    });

    try {
      await vi.waitFor(() => {
        expect(mocks.deleteImageFromCloudinary).toHaveBeenCalled();
      });
      expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledTimes(2);
    } finally {
      while (resolvers.length > 0) {
        resolvers.splice(0).forEach((resolve) => resolve());
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      await result;
    }
  });
});

describe("uploadProductImageAction", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("uploads directly to Cloudinary without a staging table", async () => {
    const file = new File(["image"], "vela.png", { type: "image/png" });
    mocks.validateImageFile.mockResolvedValue({
      buffer: Buffer.from("image"),
      mime: "image/png",
      extension: "png",
      width: 1200,
      height: 1200,
    });
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: "aroma/products/vela",
      secureUrl: "https://res.cloudinary.com/example/vela.jpg",
    });

    const result = await uploadProductImageAction({ file });

    expect(result.data).toEqual({
      publicId: "aroma/products/vela",
      secureUrl: "https://res.cloudinary.com/example/vela.jpg",
    });
  });
});
