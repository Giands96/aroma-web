import { z } from "zod";

export const whatsappConfigSchema = z.object({
  telefono: z.string().trim().regex(/^\d{10,15}$/),
  mensaje_base: z.string().trim().min(1).max(500),
  mensaje_personalizado: z.string().trim().min(1).max(500),
});

export const cartLimitsSchema = z.object({
  max_items: z.coerce.number().int().min(1).max(50),
  max_quantity_per_item: z.coerce.number().int().min(1).max(999),
});

export type WhatsAppConfigInput = z.infer<typeof whatsappConfigSchema>;
export type CartLimitsInput = z.infer<typeof cartLimitsSchema>;
