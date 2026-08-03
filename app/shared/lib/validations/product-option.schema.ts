import { z } from "zod";

export const productOptionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60),
  cantidad: z.coerce.number().int().min(1).max(99),
  precio: z.coerce.number().positive().refine(
    (precio) => Number.isInteger(precio * 100),
    "El precio debe tener como máximo dos decimales"
  ),
  activo: z.boolean().default(true),
}).strict();

export const productOptionUpdateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(60).optional(),
  cantidad: z.coerce.number().int().min(1).max(99).optional(),
  precio: z.coerce.number().positive().refine(
    (precio) => Number.isInteger(precio * 100),
    "El precio debe tener como máximo dos decimales"
  ).optional(),
  activo: z.boolean().optional(),
}).strict();

export const productOptionWithIdSchema = productOptionSchema.extend({
  id: z.uuid(),
  product_id: z.uuid(),
});

export type ProductOptionInput = z.infer<typeof productOptionSchema>;
