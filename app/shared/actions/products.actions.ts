"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertValidPackReconciliation } from "@/app/shared/actions/pack-reconciliation";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import { packSchema } from "@/app/shared/lib/validations/pack.schema";
import {
  productSchema,
  productUpdateSchema,
} from "@/app/shared/lib/validations/product.schema";
import { deleteImageFromCloudinary } from "@/app/shared/services/cloudinary.service";
import {
  createProductWithPacks,
  deleteProduct,
  getProductById,
  updateProduct,
  updateProductWithPacks,
} from "@/app/shared/services/products.service";
import { getAllPacksByProductId } from "@/app/shared/services/packs.service";

const packInputSchema = packSchema.extend({ id: z.uuid().optional() });

const createProductInputSchema = productSchema.extend({
  packs: z.array(packInputSchema).min(1),
  image_upload_id: z.uuid().optional(),
});

const updateProductInputSchema = productUpdateSchema.extend({
  id: z.uuid(),
  packs: z.array(packInputSchema).optional(),
  image_upload_id: z.uuid().optional(),
});

const deleteProductInputSchema = z.object({ id: z.uuid() });

function revalidateProductPaths(slug: string) {
  revalidatePath("/coleccion");
  revalidatePath(`/coleccion/producto/${slug}`);
  revalidatePath("/dashboard/productos");
}

export const createProductAction = actionClient
  .inputSchema(createProductInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();

    const { packs, image_upload_id, ...productInput } = parsedInput;
    const product = await createProductWithPacks(productInput, packs, image_upload_id);

    revalidateProductPaths(product.slug);
    return product;
  });

export const updateProductAction = actionClient
  .inputSchema(updateProductInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();

    const { id, packs, image_upload_id, ...productInput } = parsedInput;
    const currentProduct = await getProductById(id);
    if (!currentProduct) throw new Error("Product not found");

    if (packs) {
      const existingPacks = await getAllPacksByProductId(id);
      assertValidPackReconciliation(existingPacks, packs);
    }

    const product = packs
      ? await updateProductWithPacks(id, productInput, packs, image_upload_id)
      : image_upload_id
        ? await updateProductWithPacks(id, productInput, undefined, image_upload_id)
        : await updateProduct(id, productInput);

    if (
      currentProduct.imagen_public_id &&
      currentProduct.imagen_public_id !== product.imagen_public_id
    ) {
      try {
        await deleteImageFromCloudinary(currentProduct.imagen_public_id);
      } catch (error) {
        console.error("Failed to delete replaced product image from Cloudinary", error);
      }
    }

    revalidateProductPaths(currentProduct.slug);
    revalidateProductPaths(product.slug);
    return product;
  });

export const deleteProductAction = actionClient
  .inputSchema(deleteProductInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();

    const product = await getProductById(parsedInput.id);
    if (!product) throw new Error("Product not found");

    await deleteProduct(product.id);

    if (product.imagen_public_id) {
      try {
        await deleteImageFromCloudinary(product.imagen_public_id);
      } catch (error) {
        console.error("Failed to delete product image from Cloudinary", error);
      }
    }

    revalidateProductPaths(product.slug);
  });
