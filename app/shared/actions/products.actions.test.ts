import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createProductWithPacks: vi.fn(),
  deleteProduct: vi.fn(),
  deleteImageFromCloudinary: vi.fn(),
  getProductById: vi.fn(),
  getAllPacksByProductId: vi.fn(),
  getPacksByProductId: vi.fn(),
  updateProduct: vi.fn(),
  updateProductWithPacks: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/app/shared/actions/require-admin", () => ({
  requireAdmin: mocks.requireAdmin,
}));
vi.mock("@/app/shared/services/products.service", () => ({
  createProductWithPacks: mocks.createProductWithPacks,
  deleteProduct: mocks.deleteProduct,
  getProductById: mocks.getProductById,
  updateProduct: mocks.updateProduct,
  updateProductWithPacks: mocks.updateProductWithPacks,
}));
vi.mock("@/app/shared/services/packs.service", () => ({
  getAllPacksByProductId: mocks.getAllPacksByProductId,
  getPacksByProductId: mocks.getPacksByProductId,
}));
vi.mock("@/app/shared/services/cloudinary.service", () => ({
  deleteImageFromCloudinary: mocks.deleteImageFromCloudinary,
}));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { createProductAction, updateProductAction } from "./products.actions";

const productId = "11111111-1111-4111-8111-111111111111";
const packId = "22222222-2222-4222-8222-222222222222";
const otherPackId = "33333333-3333-4333-8333-333333333333";

describe("product actions", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.requireAdmin.mockResolvedValue({ id: "admin-id" });
  });

  it("creates a product and its packs through the transactional service", async () => {
    const product = { id: productId, slug: "vela-aurora" };
    mocks.createProductWithPacks.mockResolvedValue(product);

    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      packs: [{ cantidad: 6, precio: 84.9 }],
    });

    expect(result.data).toEqual(product);
    expect(mocks.createProductWithPacks).toHaveBeenCalledOnce();
  });

  it("rejects a submitted pack that belongs to another product before mutation", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagen_public_id: null,
    });
    mocks.getAllPacksByProductId.mockResolvedValue([{ id: packId }]);

    const result = await updateProductAction({
      id: productId,
      packs: [{ id: otherPackId, cantidad: 6, precio: 84.9 }],
    });

    expect(result.serverError).toBeDefined();
    expect(mocks.updateProductWithPacks).not.toHaveBeenCalled();
    expect(mocks.updateProduct).not.toHaveBeenCalled();
  });

  it("does not accept Cloudinary public IDs from product input", async () => {
    const result = await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      imagen_public_id: "untrusted/public-id",
      packs: [{ cantidad: 6, precio: 84.9 }],
    } as never);

    expect(result.validationErrors).toBeDefined();
    expect(mocks.createProductWithPacks).not.toHaveBeenCalled();
  });

  it("passes a server-recorded upload ID to the transactional product RPC", async () => {
    const imageUploadId = "44444444-4444-4444-8444-444444444444";
    const product = { id: productId, slug: "vela-aurora" };
    mocks.createProductWithPacks.mockResolvedValue(product);

    await createProductAction({
      nombre: "Vela Aurora",
      slug: "vela-aurora",
      descripcion: "Una vela artesanal para espacios cálidos y tranquilos.",
      image_upload_id: imageUploadId,
      packs: [{ cantidad: 6, precio: 84.9 }],
    });

    expect(mocks.createProductWithPacks).toHaveBeenCalledWith(
      expect.not.objectContaining({ imagen_public_id: expect.anything() }),
      expect.any(Array),
      imageUploadId
    );
  });

  it("does not reactivate a product when an update omits activo", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagen_public_id: null,
    });
    mocks.updateProduct.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    await updateProductAction({ id: productId, nombre: "Vela Boreal" });

    expect(mocks.updateProduct).toHaveBeenCalledWith(productId, {
      nombre: "Vela Boreal",
    });
  });

  it("allows an inactive pack already owned by the product to be updated", async () => {
    mocks.getProductById.mockResolvedValue({
      id: productId,
      slug: "vela-aurora",
      imagen_public_id: null,
    });
    mocks.getPacksByProductId.mockResolvedValue([]);
    mocks.getAllPacksByProductId.mockResolvedValue([{ id: packId, activo: false }]);
    mocks.updateProductWithPacks.mockResolvedValue({ id: productId, slug: "vela-aurora" });

    const result = await updateProductAction({
      id: productId,
      packs: [{ id: packId, cantidad: 6, precio: 84.9, activo: false }],
    });

    expect(result.data).toMatchObject({ id: productId });
    expect(mocks.updateProductWithPacks).toHaveBeenCalledOnce();
  });
});
