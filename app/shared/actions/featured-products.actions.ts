"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import {
  actionClient,
  sanitizeErrorMetadata,
} from "@/app/shared/lib/safe-action";
import {
  createFeaturedProduct,
  deleteFeaturedProduct,
} from "@/app/shared/services/products.service";
import { ROUTES } from "@/app/shared/routes/routes";

const createFeaturedProductInputSchema = z.strictObject({
  productId: z.uuid(),
});

const deleteFeaturedProductInputSchema = z.strictObject({
  id: z.number().int().positive(),
});

function revalidateFeaturedProductPaths() {
  revalidatePath(ROUTES.DASHBOARD.FEATURED);
}

export const createFeaturedProductAction = actionClient
  .inputSchema(createFeaturedProductInputSchema)
  .action(async ({ parsedInput }) => {
    try {
      await requireAdmin();
    } catch (error) {
      console.error("featured_product_create_failed", {
        stage: "authorization",
        ...sanitizeErrorMetadata(error),
      });
      throw error;
    }

    try {
      await createFeaturedProduct(parsedInput.productId);
    } catch (error) {
      console.error("featured_product_create_failed", {
        stage: "service",
        ...sanitizeErrorMetadata(error),
      });
      throw error;
    }

    revalidateFeaturedProductPaths();
  });

export const deleteFeaturedProductAction = actionClient
  .inputSchema(deleteFeaturedProductInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    await deleteFeaturedProduct(String(parsedInput.id));
    revalidateFeaturedProductPaths();
  });
