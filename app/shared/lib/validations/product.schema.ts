import { z } from "zod";

export const productSchema = z.strictObject({
  nombre: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().trim().min(10).max(2_000),
  activo: z.boolean().default(true),
});

export const productUpdateSchema = z.strictObject({
  nombre: z.string().trim().min(2).max(120).optional(),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/).optional(),
  descripcion: z.string().trim().min(10).max(2_000).optional(),
  activo: z.boolean().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
