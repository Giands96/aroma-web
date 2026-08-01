import { z } from "zod";

export const packSchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(99),
  precio: z.coerce.number().positive().refine(
    (price) => Number.isInteger(price * 100),
    "El precio debe tener como máximo dos decimales"
  ),
  activo: z.boolean().default(true),
}).strict();

export const packUpdateSchema = z.object({
  cantidad: z.coerce.number().int().min(1).max(99).optional(),
  precio: z.coerce.number().positive().refine(
    (price) => Number.isInteger(price * 100),
    "El precio debe tener como máximo dos decimales"
  ).optional(),
  activo: z.boolean().optional(),
}).strict();

export const packWithIdSchema = packSchema.extend({
  id: z.uuid(),
  product_id: z.uuid(),
});

export type PackInput = z.infer<typeof packSchema>;
