"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import {
  cartLimitsSchema,
  whatsappConfigSchema,
} from "@/app/shared/lib/validations/config.schema";
import {
  PUBLIC_WHATSAPP_CONFIG_CACHE_TAG,
  updateCartLimits,
  updateWhatsAppConfig,
} from "@/app/shared/services/config.service";
import { ROUTES } from "@/app/shared/routes/routes";

export const updateWhatsAppConfigAction = actionClient
  .inputSchema(whatsappConfigSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const config = await updateWhatsAppConfig(parsedInput);
    revalidateTag(PUBLIC_WHATSAPP_CONFIG_CACHE_TAG, "max");
    revalidatePath(ROUTES.DASHBOARD.CONFIGURATION);
    return config;
  });

export const updateCartLimitsAction = actionClient
  .inputSchema(cartLimitsSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const limits = await updateCartLimits(parsedInput);
    revalidatePath(ROUTES.DASHBOARD.CONFIGURATION);
    return limits;
  });
