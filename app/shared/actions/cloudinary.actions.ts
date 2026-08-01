"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import { actionClient } from "@/app/shared/lib/safe-action";
import { validateImageFile } from "@/app/shared/lib/validations/image.schema";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/app/shared/services/cloudinary.service";
import {
  clearProductImage,
  getProductById,
} from "@/app/shared/services/products.service";
import { createProductImageUpload } from "@/app/shared/services/product-image-uploads.service";

const uploadImageInputSchema = z.object({
  file: z.instanceof(File, { message: "Se requiere una imagen." }),
});

const deleteImageInputSchema = z.object({
  productId: z.uuid(),
});

export const uploadProductImageAction = actionClient
  .inputSchema(uploadImageInputSchema)
  .action(async ({ parsedInput }) => {
    const admin = await requireAdmin();
    const image = await validateImageFile(parsedInput.file);
    const uploadedImage = await uploadImageToCloudinary(image);

    try {
      const imageUpload = await createProductImageUpload(
        uploadedImage.publicId,
        uploadedImage.secureUrl,
        admin.id
      );
      return { id: imageUpload.id, secureUrl: imageUpload.secure_url };
    } catch (error) {
      await deleteImageFromCloudinary(uploadedImage.publicId);
      throw error;
    }
  });

export const deleteProductImageAction = actionClient
  .inputSchema(deleteImageInputSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const product = await getProductById(parsedInput.productId);

    if (!product?.imagen_public_id) {
      return;
    }

    const clearedProduct = await clearProductImage(
      product.id,
      product.imagen_public_id
    );
    if (clearedProduct) {
      revalidatePath("/coleccion");
      revalidatePath(`/coleccion/producto/${clearedProduct.slug}`);
      revalidatePath("/dashboard/productos");
    }

    try {
      await deleteImageFromCloudinary(product.imagen_public_id);
    } catch (error) {
      console.error("Failed to delete product image from Cloudinary", error);
    }
  });
