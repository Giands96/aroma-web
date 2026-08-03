import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createProductWithOptions: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
  deleteProduct: vi.fn(),
  getAllProductOptionsByProductId: vi.fn(),
  getProductById: vi.fn(),
  requireAdmin: vi.fn(),
  revalidatePath: vi.fn(),
  updateProduct: vi.fn(),
  updateProductWithOptions: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock("@/app/shared/services/products.service", () => ({
  createProductWithOptions: mocks.createProductWithOptions,
  deleteProduct: mocks.deleteProduct,
  getProductById: mocks.getProductById,
  updateProduct: mocks.updateProduct,
  updateProductWithOptions: mocks.updateProductWithOptions,
}));
vi.mock("@/app/shared/services/product-options.service", () => ({
  getAllProductOptionsByProductId: mocks.getAllProductOptionsByProductId,
}));
vi.mock("@/app/shared/services/cloudinary.service", () => ({
  deleteImageFromCloudinary: mocks.deleteImageFromCloudinary,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createProductAction, updateProductAction } from "./products.actions";

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
