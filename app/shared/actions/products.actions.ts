"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import {
  assertActiveProductHasOption,
  assertValidProductOptionReconciliation,
} from "@/app/shared/actions/product-option-reconciliation";
import { adminActionClient } from "@/app/shared/lib/safe-action";
import { validateImageFile } from "@/app/shared/lib/validations/image.schema";
import { productOptionSchema } from "@/app/shared/lib/validations/product-option.schema";
import {
  productImageEntriesSchema,
  type ProductImage,
  type ProductImageEntry,
} from "@/app/shared/lib/validations/product-image.schema";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import type { Product } from "@/app/shared/types/product.types";
import {
  productSchema,
  productUpdateSchema,
} from "@/app/shared/lib/validations/product.schema";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/app/shared/services/cloudinary.service";
import {
  PUBLIC_PRODUCTS_CACHE_TAG,
  createProductWithOptions,
  deleteProduct,
  getProductById,
  updateProduct,
  updateProductWithOptions,
} from "@/app/shared/services/products.service";
import { getAllProductOptionsByProductId } from "@/app/shared/services/product-options.service";
import { ROUTES } from "@/app/shared/routes/routes";

const productOptionInputSchema = productOptionSchema.extend({ id: z.uuid().optional() });

const createProductInputSchema = productSchema.extend({
  options: z.array(productOptionInputSchema).min(1).refine(
    (options) => options.some((option) => option.activo),
    "An active product requires an active option."
  ),
  image_entries: productImageEntriesSchema.default([]),
});

const updateProductInputSchema = productUpdateSchema.extend({
  id: z.uuid(),
  options: z.array(productOptionInputSchema).optional(),
  image_entries: productImageEntriesSchema.optional(),
});

const deleteProductInputSchema = z.object({ id: z.uuid() });

function revalidateProductPaths(slug: string) {
  revalidatePath(ROUTES.COLECCION);
  revalidatePath(ROUTES.PRODUCT(slug));
  revalidatePath(ROUTES.DASHBOARD.PRODUCTS);
}

async function resolveImageEntries(
  entries: ProductImageEntry[],
  currentImages: ProductImage[]
): Promise<{ images: ProductImage[]; uploadedImages: ProductImage[] }> {
  const publicIds = entries
    .filter((entry): entry is Extract<ProductImageEntry, { type: "existing" }> => entry.type === "existing")
    .map((entry) => entry.public_id);
  if (new Set(publicIds).size !== publicIds.length) {
    throw new Error("Duplicate product images are not allowed");
  }

  const existingByPublicId = new Map(
    currentImages.map((image) => [image.public_id, image])
  );
  const resolvedEntries = await Promise.allSettled(
    entries.map(async (entry) => {
      if (entry.type === "existing") {
        const image = existingByPublicId.get(entry.public_id);
        if (!image) throw new Error("La imagen existente no pertenece al producto.");
        return { image, uploaded: false };
      }

      const validatedImage = await validateImageFile(entry.file);
      const uploadedImage = await uploadImageToCloudinary(validatedImage);
      return {
        image: {
          public_id: uploadedImage.publicId,
          secure_url: uploadedImage.secureUrl,
        },
        uploaded: true,
      };
    })
  );
  const images: ProductImage[] = [];
  const uploadedImages: ProductImage[] = [];
  const failedEntry = resolvedEntries.find((entry) => entry.status === "rejected");

  for (const entry of resolvedEntries) {
    if (entry.status === "fulfilled") {
      images.push(entry.value.image);
      if (entry.value.uploaded) {
        uploadedImages.push(entry.value.image);
      }
    }
  }

  if (failedEntry?.status === "rejected") {
    await deleteImages(uploadedImages);
    throw failedEntry.reason;
  }

  return { images, uploadedImages };
}

async function deleteImages(images: ProductImage[]) {
  await Promise.all(
    images.map(async (image) => {
      try {
        await deleteImageFromCloudinary(image.public_id);
      } catch (error) {
        console.error("Failed to delete product image from Cloudinary", error);
      }
    })
  );
}

function getRemovedImages(currentImages: ProductImage[], nextImages: ProductImage[]) {
  const nextPublicIds = new Set(nextImages.map((image) => image.public_id));
  return currentImages.filter((image) => !nextPublicIds.has(image.public_id));
}

function withProductImages<T extends object>(input: T, images: ProductImage[]) {
  return {
    ...input,
    imagenes: images,
    imagen_public_id: images[0]?.public_id ?? null,
    imagen_url: images[0]?.secure_url ?? null,
  };
}

export const createProductAction = adminActionClient.inputSchema(createProductInputSchema).action(async ({ parsedInput }) => {
    const { options, image_entries, ...productInput } = parsedInput;
    const { images, uploadedImages } = await resolveImageEntries(image_entries, []);
    let savedProduct: Product;
    try {
      savedProduct = await createProductWithOptions(
        withProductImages(productInput, images),
        options
      );
    } catch (error) {
      await deleteImages(uploadedImages);
      throw error;
    }

    revalidateProductPaths(savedProduct.slug);
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");
    return savedProduct;
  });

export const updateProductAction = adminActionClient
  .inputSchema(updateProductInputSchema)
  .action(async ({ parsedInput }) => {
    const { id, options, image_entries, ...productInput } = parsedInput;
    const currentProduct = await getProductById(id);
    if (!currentProduct) throw new Error("Product not found");

    const currentImages = getProductImages(currentProduct);
    const resolvedGallery = image_entries
      ? await resolveImageEntries(image_entries, currentImages)
      : undefined;
    const nextImages = resolvedGallery?.images;

    const newImages = resolvedGallery?.uploadedImages ?? [];
    let savedProduct;
    try {
      if (options) {
        const existingOptions = await getAllProductOptionsByProductId(id);
        assertValidProductOptionReconciliation(existingOptions, options);
        assertActiveProductHasOption(productInput.activo ?? currentProduct.activo, options);
      } else if (productInput.activo === true) {
        const existingOptions = await getAllProductOptionsByProductId(id);
        assertActiveProductHasOption(true, existingOptions);
      }

      const productInputWithImages = nextImages
        ? withProductImages(productInput, nextImages)
        : productInput;
      savedProduct = options
        ? await updateProductWithOptions(id, productInputWithImages, options)
        : await updateProduct(id, productInputWithImages);
    } catch (error) {
      await deleteImages(newImages);
      throw error;
    }

    if (nextImages) {
      await deleteImages(getRemovedImages(currentImages, nextImages));
    }

    revalidateProductPaths(currentProduct.slug);
    revalidateProductPaths(savedProduct.slug);
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");
    return savedProduct;
  });

export const deleteProductAction = adminActionClient
  .inputSchema(deleteProductInputSchema)
  .action(async ({ parsedInput }) => {
    const product = await getProductById(parsedInput.id);
    if (!product) throw new Error("Product not found");

    await deleteProduct(product.id);

    await deleteImages(getProductImages(product));

    revalidateProductPaths(product.slug);
    revalidateTag(PUBLIC_PRODUCTS_CACHE_TAG, "max");
  });
