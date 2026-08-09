import { z } from "zod";

export const MAX_PRODUCT_IMAGES = 5;

export const productImageSchema = z.strictObject({
  public_id: z.string().trim().min(1).max(255),
  secure_url: z.url(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const productImagesSchema = z
  .array(productImageSchema)
  .max(MAX_PRODUCT_IMAGES, "Un producto puede tener como máximo 5 imágenes.");

export const productImageEntriesSchema = z
  .array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("existing"),
        public_id: z.string().trim().min(1).max(255),
      }),
      z.object({
        type: z.literal("file"),
        file: z.instanceof(File, { message: "Se requiere una imagen." }),
      }),
    ])
  )
  .max(MAX_PRODUCT_IMAGES, "Un producto puede tener como máximo 5 imágenes.");

export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductImageEntry = z.infer<typeof productImageEntriesSchema>[number];
