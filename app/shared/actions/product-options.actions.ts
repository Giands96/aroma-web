"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import {
  productOptionSchema,
  productOptionUpdateSchema,
} from "@/app/shared/lib/validations/product-option.schema";
import { getProductById } from "@/app/shared/services/products.service";
import {
  createProductOption,
  deleteProductOption,
  getProductOptionById,
  updateProductOption,
} from "@/app/shared/services/product-options.service";

const createProductOptionInputSchema = productOptionSchema.extend({
  product_id: z.uuid(),
});
const updateProductOptionInputSchema = productOptionUpdateSchema.extend({
  id: z.uuid(),
});
const deleteProductOptionInputSchema = z.object({ id: z.uuid() });

async function revalidateProductOptionPaths(productId: string) {
  revalidatePath("/coleccion");
  revalidatePath("/dashboard/productos");

  const product = await getProductById(productId);
  if (product) {
    revalidatePath(`/coleccion/producto/${product.slug}`);
  }
}

export const createProductOptionAction = actionClient
  .inputSchema(createProductOptionInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const option = await createProductOption(parsedInput);
    await revalidateProductOptionPaths(option.product_id);
    return option;
  });

export const updateProductOptionAction = actionClient
  .inputSchema(updateProductOptionInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const { id, ...input } = parsedInput;
    const option = await getProductOptionById(id);
    if (!option) throw new Error("Product option not found");

    const updatedOption = await updateProductOption(id, input);
    await revalidateProductOptionPaths(updatedOption.product_id);
    return updatedOption;
  });

export const deleteProductOptionAction = actionClient
  .inputSchema(deleteProductOptionInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const option = await getProductOptionById(parsedInput.id);
    if (!option) throw new Error("Product option not found");

    await deleteProductOption(option.id);
    await revalidateProductOptionPaths(option.product_id);
  });
