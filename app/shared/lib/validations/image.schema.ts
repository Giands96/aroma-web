import { fileTypeFromBuffer } from "file-type";
import sharp, { type Metadata } from "sharp";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
//Buffer es un tipo que representa una secuencia de bytes en Node.js, 
// y se utiliza para manejar datos binarios. En este caso,
//  se usa para representar el contenido de la imagen que se está validando.
export interface ValidatedImage {
  buffer: Buffer;
  mime: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
  width: number;
  height: number;
}

export async function validateImageBuffer(
  buffer: Buffer,
  declaredMime?: string
): Promise<ValidatedImage> {
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen debe pesar entre 1 byte y 5 MB.");
  }

  const detected = await fileTypeFromBuffer(buffer);
  if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
    throw new Error("El archivo no es una imagen válida.");
  }

  if (declaredMime && declaredMime !== detected.mime) {
    throw new Error("El tipo declarado no coincide con el contenido del archivo.");
  }

  let metadata: Metadata;
  try {
    metadata = await sharp(buffer, {
      failOn: "error",
      limitInputPixels: 40_000_000,
    }).metadata();
  } catch {
    throw new Error("El archivo no es una imagen válida.");
  }

  if (!metadata.width || !metadata.height) {
    throw new Error("El archivo no es una imagen válida.");
  }

  const extensionByMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  } as const;

  return {
    buffer,
    mime: detected.mime as ValidatedImage["mime"],
    extension: extensionByMime[detected.mime as ValidatedImage["mime"]],
    width: metadata.width,
    height: metadata.height,
  };
}

export async function validateImageFile(file: File): Promise<ValidatedImage> {
  return validateImageBuffer(Buffer.from(await file.arrayBuffer()), file.type);
}
