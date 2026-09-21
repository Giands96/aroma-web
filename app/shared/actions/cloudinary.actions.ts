"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { adminActionClient } from "@/app/shared/lib/safe-action";
import { validateImageFile } from "@/app/shared/lib/validations/image.schema";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/app/shared/services/cloudinary.service";
import {
  getProductById,
  setProductImages,
} from "@/app/shared/services/products.service";
import { ROUTES } from "@/app/shared/routes/routes";

const uploadImageInputSchema = z.object({
  file: z.instanceof(File, { message: "Se requiere una imagen." }),
});

const deleteImageInputSchema = z.object({
  productId: z.uuid(),
  publicId: z.string().trim().min(1).optional(),
});

export const uploadProductImageAction = adminActionClient
  .inputSchema(uploadImageInputSchema)
  .action(async ({ parsedInput }) => {
    const image = await validateImageFile(parsedInput.file);
    const uploadedImage = await uploadImageToCloudinary(image);

    return {
      publicId: uploadedImage.publicId,
      secureUrl: uploadedImage.secureUrl,
    };
  });

export const deleteProductImageAction = adminActionClient
  .inputSchema(deleteImageInputSchema)
  .action(async ({ parsedInput }) => {
    const product = await getProductById(parsedInput.productId);
    if (!product) return;

    const images = getProductImages(product);
    const imagesToDelete = parsedInput.publicId
      ? images.filter((image) => image.public_id === parsedInput.publicId)
      : images;
    if (imagesToDelete.length === 0) return;

    const nextImages = parsedInput.publicId
      ? images.filter((image) => image.public_id !== parsedInput.publicId)
      : [];
    const clearedProduct = await setProductImages(product.id, nextImages);
    if (clearedProduct) {
      revalidatePath(ROUTES.COLECCION);
      revalidatePath(ROUTES.PRODUCT(clearedProduct.slug));
      revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
    }

    await Promise.all(
      imagesToDelete.map(async (image) => {
        try {
          await deleteImageFromCloudinary(image.public_id);
        } catch (error) {
          console.error("Failed to delete product image from Cloudinary", error);
        }
      })
    );
  });
