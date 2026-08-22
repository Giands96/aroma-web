import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductWithOptions: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
  deleteProduct: vi.fn(),
  getAllProductOptionsByProductId: vi.fn(),
  getProductById: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  setProductImages: vi.fn(),
  uploadImageToCloudinary: vi.fn(),
  validateImageFile: vi.fn(),
  updateProduct: vi.fn(),
  updateProductWithOptions: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/app/shared/services/products.service", () => ({
  PUBLIC_PRODUCTS_CACHE_TAG: "public-products",
  createProductWithOptions: mocks.createProductWithOptions,
  deleteProduct: mocks.deleteProduct,
  getProductById: mocks.getProductById,
  setProductImages: mocks.setProductImages,
  updateProduct: mocks.updateProduct,
  updateProductWithOptions: mocks.updateProductWithOptions,
}));
vi.mock("@/app/shared/services/product-options.service", () => ({
  getAllProductOptionsByProductId: mocks.getAllProductOptionsByProductId,
}));
vi.mock("@/app/shared/services/cloudinary.service", () => ({
  deleteImageFromCloudinary: mocks.deleteImageFromCloudinary,
  uploadImageToCloudinary: mocks.uploadImageToCloudinary,
}));
vi.mock("@/app/shared/lib/validations/image.schema", () => ({
  validateImageFile: mocks.validateImageFile,
}));
vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
  revalidateTag: mocks.revalidateTag,
}));

import {
  createProductAction,
  deleteProductAction,
  updateProductAction,
} from "./products.actions";

const productId = "11111111-1111-4111-8111-111111111111";
const optionId = "22222222-2222-4222-8222-222222222222";

describe("product actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("creates a product with administrator-defined options", async () => {
    const product = { id: productId, slug: "vela-aurora" };
    mocks.createProductWithOptions.mockResolvedValue(product);

    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
    });

    expect(result.data).toEqual(product);
    expect(mocks.createProductWithOptions).toHaveBeenCalledOnce();
  });

  it("revalidates the public catalog after creating a product", async () => {
    mocks.createProductWithOptions.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
    });

    expect(mocks.revalidateTag).toHaveBeenCalledWith("public-products", "max");
  });

  it("revalidates the public catalog after updating a product", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: true,
      imagenes: [],
    });
    mocks.updateProduct.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    await updateProductAction({ id: productId, nombre: "Vela Aurora renovada" });

    expect(mocks.revalidateTag).toHaveBeenCalledWith("public-products", "max");
  });

  it("revalidates the public catalog after deleting a product", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagenes: [],
    });
    mocks.deleteProduct.mockResolvedValue(undefined);

    await deleteProductAction({ id: productId });

    expect(mocks.revalidateTag).toHaveBeenCalledWith("public-products", "max");
  });

  it("uploads local image files before saving the product gallery", async () => {
    const file = new File(["image"], "vela.png", { type: "image/png" });
    const uploadedImage = {
      public_id: "aroma/products/vela-aurora",
      secure_url: "https://res.cloudinary.com/example/vela-aurora.jpg",
    };
    const product = { id: productId, slug: "vela-aurora" };
    mocks.validateImageFile.mockResolvedValue({
      buffer: Buffer.from("image"),
      mime: "image/png",
      extension: "png",
      width: 1200,
      height: 1200,
    });
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: uploadedImage.public_id,
      secureUrl: uploadedImage.secure_url,
    });
    mocks.createProductWithOptions.mockResolvedValue(product);

    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
      image_entries: [{ type: "file", file }],
    });

    expect(result.data).toMatchObject(product);
    expect(mocks.validateImageFile).toHaveBeenCalledWith(file);
    expect(mocks.uploadImageToCloudinary).toHaveBeenCalledOnce();
    expect(mocks.createProductWithOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        imagenes: [
          {
            public_id: uploadedImage.public_id,
            secure_url: uploadedImage.secure_url,
          },
        ],
      }),
      expect.any(Array)
    );
  });

  it("starts all gallery file validations before any one completes", async () => {
    const firstFile = new File(["first"], "first.png", { type: "image/png" });
    const secondFile = new File(["second"], "second.png", { type: "image/png" });
    const resolvers: Array<() => void> = [];
    mocks.validateImageFile.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(() =>
            resolve({
              buffer: Buffer.from("image"),
              mime: "image/png",
              extension: "png",
              width: 1200,
              height: 1200,
            })
          );
        })
    );
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: "aroma/products/vela-aurora",
      secureUrl: "https://res.cloudinary.com/example/vela-aurora.jpg",
    });
    mocks.createProductWithOptions.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    const result = createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
      image_entries: [
        { type: "file", file: firstFile },
        { type: "file", file: secondFile },
      ],
    });

    try {
      await vi.waitFor(() => {
        expect(mocks.validateImageFile).toHaveBeenCalled();
      });
      expect(mocks.validateImageFile).toHaveBeenCalledTimes(2);
    } finally {
      while (resolvers.length > 0) {
        resolvers.splice(0).forEach((resolve) => resolve());
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      await result;
    }
  });

  it("rejects an active product update without active options", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: true,
      imagen_public_id: null,
    });
    mocks.getAllProductOptionsByProductId.mockResolvedValue([{ id: optionId, activo: true }]);

    const result = await updateProductAction({
      id: productId,
      options: [{ id: optionId, nombre: "Unidad", cantidad: 1, precio: 12.5, activo: false }],
    });

    expect(result.serverError).toBeDefined();
    expect(mocks.updateProductWithOptions).not.toHaveBeenCalled();
  });

  it("deletes removed Cloudinary images after replacing the gallery", async () => {
    const file = new File(["new image"], "new.png", { type: "image/png" });
    const oldImage = {
      public_id: "aroma/products/old",
      secure_url: "https://res.cloudinary.com/example/old.jpg",
    };
    const nextImage = {
      public_id: "aroma/products/new",
      secure_url: "https://res.cloudinary.com/example/new.jpg",
    };
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: true,
      imagenes: [oldImage],
      product_options: [{ id: optionId, activo: true }],
    });
    mocks.validateImageFile.mockResolvedValue({
      buffer: Buffer.from("new image"),
      mime: "image/png",
      extension: "png",
      width: 1200,
      height: 1200,
    });
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: nextImage.public_id,
      secureUrl: nextImage.secure_url,
    });
    mocks.updateProduct.mockResolvedValue({ id: productId, slug: "vela-aurora" });
    mocks.updateProduct.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagenes: [{ public_id: nextImage.public_id, secure_url: nextImage.secure_url }],
    });

    const result = await updateProductAction({
      id: productId,
      image_entries: [{ type: "file", file }],
    });

    expect(result.data).toMatchObject({ id: productId });
    expect(mocks.updateProduct).toHaveBeenCalledWith(
      productId,
      expect.objectContaining({
        imagenes: [{ public_id: nextImage.public_id, secure_url: nextImage.secure_url }],
      })
    );
    expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledWith(oldImage.public_id);
  });

  it("starts independent removed-image deletions together", async () => {
    const oldImages = [
      {
        public_id: "aroma/products/old-front",
        secure_url: "https://res.cloudinary.com/example/old-front.jpg",
      },
      {
        public_id: "aroma/products/old-back",
        secure_url: "https://res.cloudinary.com/example/old-back.jpg",
      },
    ];
    const resolvers: Array<() => void> = [];
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: true,
      imagenes: oldImages,
    });
    mocks.updateProduct.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagenes: [],
    });
    mocks.deleteImageFromCloudinary.mockImplementation(
      () => new Promise<void>((resolve) => resolvers.push(resolve))
    );

    const result = updateProductAction({ id: productId, image_entries: [] });

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

  it("cleans uploaded Cloudinary images when product creation fails", async () => {
    const file = new File(["image"], "orphaned.png", { type: "image/png" });
    const uploadedImage = {
      public_id: "aroma/products/orphaned",
      secure_url: "https://res.cloudinary.com/example/orphaned.jpg",
    };
    mocks.validateImageFile.mockResolvedValue({
      buffer: Buffer.from("image"),
      mime: "image/png",
      extension: "png",
      width: 1200,
      height: 1200,
    });
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: uploadedImage.public_id,
      secureUrl: uploadedImage.secure_url,
    });
    mocks.createProductWithOptions.mockRejectedValue(new Error("database failure"));

    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
      image_entries: [{ type: "file", file }],
    });

    expect(result.serverError).toBeDefined();
    expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledWith(uploadedImage.public_id);
  });

  it("cleans newly uploaded images when an update fails", async () => {
    const file = new File(["image"], "update-orphaned.png", { type: "image/png" });
    const uploadedImage = {
      public_id: "aroma/products/update-orphaned",
      secure_url: "https://res.cloudinary.com/example/update-orphaned.jpg",
    };
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: true,
      imagenes: [],
    });
    mocks.validateImageFile.mockResolvedValue({
      buffer: Buffer.from("image"),
      mime: "image/png",
      extension: "png",
      width: 1200,
      height: 1200,
    });
    mocks.uploadImageToCloudinary.mockResolvedValue({
      publicId: uploadedImage.public_id,
      secureUrl: uploadedImage.secure_url,
    });
    mocks.updateProduct.mockRejectedValue(new Error("database failure"));

    const result = await updateProductAction({
      id: productId,
      image_entries: [{ type: "file", file }],
    });

    expect(result.serverError).toBeDefined();
    expect(mocks.deleteImageFromCloudinary).toHaveBeenCalledWith(uploadedImage.public_id);
  });

  it("rejects reactivating a product when it has no active options", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      activo: false,
      imagen_public_id: null,
    });
    mocks.getAllProductOptionsByProductId.mockResolvedValue([
      { id: optionId, activo: false },
    ]);
    mocks.updateProduct.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    const result = await updateProductAction({ id: productId, activo: true });

    expect(result.serverError).toBeDefined();
    expect(mocks.updateProduct).not.toHaveBeenCalled();
  });

  it("does not accept Cloudinary public IDs from product input", async () => {
    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      imagen_public_id: "untrusted/public-id",
      options: [{ nombre: "Unidad", cantidad: 1, precio: 12.5 }],
    } as never);

    expect(result.validationErrors).toBeDefined();
    expect(mocks.createProductWithOptions).not.toHaveBeenCalled();
  });
});
