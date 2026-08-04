import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { ValidatedImage } from "@/app/shared/lib/validations/image.schema";

function configureCloudinary() {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error("Cloudinary no está configurado en el servidor.");
  }

  cloudinary.config(true);
}

export async function uploadImageToCloudinary(
  image: ValidatedImage,
  folder = "aroma/products"
): Promise<{ publicId: string; secureUrl: string }> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: image.extension,
        unique_filename: true,
        use_filename: false,
      },
      (error, result) => {
        if (error || !result) {
          const message =
            error && typeof error === "object" && "message" in error
              ? String(error.message)
              : "No se pudo subir la imagen.";
          reject(error instanceof Error ? error : new Error(message));
          return;
        }

        resolve({ publicId: result.public_id, secureUrl: result.secure_url });
      }
    );

    stream.end(image.buffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  configureCloudinary();

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  });

  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error("No se pudo eliminar la imagen de Cloudinary.");
  }
}
