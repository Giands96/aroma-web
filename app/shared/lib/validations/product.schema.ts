import { z } from "zod";

export const productSchema = z.object({
  nombre: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().trim().min(10).max(2_000),
  activo: z.boolean().default(true),
}).strict();

export const productUpdateSchema = z.object({
  nombre: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  descripcion: z.string().trim().min(10).max(2_000).optional(),
  activo: z.boolean().optional(),
}).strict();

export const productWithIdSchema = productSchema.extend({
  id: z.uuid(),
});

export type ProductInput = z.infer<typeof productSchema>;
