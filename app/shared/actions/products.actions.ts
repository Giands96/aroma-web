"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  assertActiveProductHasOption,
  assertValidProductOptionReconciliation,
} from "@/app/shared/actions/product-option-reconciliation";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import { productOptionSchema } from "@/app/shared/lib/validations/product-option.schema";
import {
  productSchema,
  productUpdateSchema,
} from "@/app/shared/lib/validations/product.schema";
import { deleteImageFromCloudinary } from "@/app/shared/services/cloudinary.service";
import {
  createProductWithOptions,
  deleteProduct,
  getProductById,
  updateProduct,
  updateProductWithOptions,
} from "@/app/shared/services/products.service";
import { getAllProductOptionsByProductId } from "@/app/shared/services/product-options.service";

const productOptionInputSchema = productOptionSchema.extend({ id: z.uuid().optional() });

const createProductInputSchema = productSchema.extend({
  options: z.array(productOptionInputSchema).min(1).refine(
    (options) => options.some((option) => option.activo),
    "An active product requires an active option."
  ),
  image_upload_id: z.uuid().optional(),
});

const updateProductInputSchema = productUpdateSchema.extend({
  id: z.uuid(),
  options: z.array(productOptionInputSchema).optional(),
  image_upload_id: z.uuid().optional(),
});

const deleteProductInputSchema = z.object({ id: z.uuid() });

function revalidateProductPaths(slug: string) {
  revalidatePath("/coleccion");
  revalidatePath(`/coleccion/producto/${slug}`);
  revalidatePath("/dashboard/productos");
}

export const createProductAction = actionClient.inputSchema(createProductInputSchema).action(async ({ parsedInput }) => {
    await requireAdmin();

    const { options, image_upload_id, ...productInput } = parsedInput;
    const product = await createProductWithOptions(productInput, options, image_upload_id);

    revalidateProductPaths(product.slug);
    return product;
  });

export const updateProductAction = actionClient
  .inputSchema(updateProductInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();

    const { id, options, image_upload_id, ...productInput } = parsedInput;
    const currentProduct = await getProductById(id);
    if (!currentProduct) throw new Error("Product not found");

    if (options) {
      const existingOptions = await getAllProductOptionsByProductId(id);
      assertValidProductOptionReconciliation(existingOptions, options);
      assertActiveProductHasOption(productInput.activo ?? currentProduct.activo, options);
    } else if (productInput.activo === true) {
      const existingOptions = await getAllProductOptionsByProductId(id);
      assertActiveProductHasOption(true, existingOptions);
    }

    const product = options
      ? await updateProductWithOptions(id, productInput, options, image_upload_id)
      : image_upload_id
        ? await updateProductWithOptions(id, productInput, undefined, image_upload_id)
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
