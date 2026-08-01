"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import {
  packSchema,
  packUpdateSchema,
} from "@/app/shared/lib/validations/pack.schema";
import { getProductById } from "@/app/shared/services/products.service";
import {
  createPack,
  deletePack,
  getPackById,
  updatePack,
} from "@/app/shared/services/packs.service";

const createPackInputSchema = packSchema.extend({ product_id: z.uuid() });
const updatePackInputSchema = packUpdateSchema.extend({ id: z.uuid() });
const deletePackInputSchema = z.object({ id: z.uuid() });

async function revalidatePackPaths(productId: string) {
  revalidatePath("/coleccion");
  revalidatePath("/dashboard/productos");

  const product = await getProductById(productId);
  if (product) {
    revalidatePath(`/coleccion/producto/${product.slug}`);
  }
}

export const createPackAction = actionClient
  .inputSchema(createPackInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const pack = await createPack(parsedInput);
    await revalidatePackPaths(pack.product_id);
    return pack;
  });

export const updatePackAction = actionClient
  .inputSchema(updatePackInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const { id, ...input } = parsedInput;
    const existingPack = await getPackById(id);
    if (!existingPack) throw new Error("Pack not found");
    const pack = await updatePack(id, input);
    await revalidatePackPaths(pack.product_id);
    return pack;
  });

export const deletePackAction = actionClient
  .inputSchema(deletePackInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const pack = await getPackById(parsedInput.id);
    if (!pack) throw new Error("Pack not found");
    await deletePack(parsedInput.id);
    await revalidatePackPaths(pack.product_id);
  });
