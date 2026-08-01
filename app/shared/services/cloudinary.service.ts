import "server-only";
import { v2 as cloudinary } from "cloudinary";
import type { ValidatedImage } from "@/app/shared/lib/validations/image.schema";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado en el servidor.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
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
          reject(error ?? new Error("No se pudo subir la imagen."));
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
