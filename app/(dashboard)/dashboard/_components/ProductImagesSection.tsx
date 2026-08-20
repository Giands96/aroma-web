import { useEffect, useState } from "react";
import Image from "next/image";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { MAX_PRODUCT_IMAGES } from "@/app/shared/lib/validations/product-image.schema";

export type ImageDraft =
  | {
      key: string;
      type: "existing";
      public_id: string;
      secure_url: string;
    }
  | {
      key: string;
      type: "local";
      file: File;
    };

interface LocalImagePreviewProps {
  file: File;
  alt: string;
}

function LocalImagePreview({ file, alt }: LocalImagePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const objectUrl = URL.createObjectURL(file);

    queueMicrotask(() => {
      if (active) setPreviewUrl(objectUrl);
    });

    return () => {
      active = false;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (!previewUrl) return <div aria-hidden="true" className="size-full bg-zinc-100" />;

  return (
    <Image
      src={previewUrl}
      alt={alt}
      fill
      unoptimized
      sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
      className="object-cover"
    />
  );
}

interface ProductImagesSectionProps {
  images: ImageDraft[];
  productName: string;
  draggedIndex: number | null;
  uploadError: string | null;
  onPointerDown: (event: React.PointerEvent<HTMLLIElement>, index: number) => void;
  onPointerMove: (event: React.PointerEvent<HTMLLIElement>) => void;
  onPointerEnd: () => void;
  onRemove: (key: string) => void;
  onSelect: (files: FileList | null) => void;
}

export function ProductImagesSection({
  images,
  productName,
  draggedIndex,
  uploadError,
  onPointerDown,
  onPointerMove,
  onPointerEnd,
  onRemove,
  onSelect,
}: ProductImagesSectionProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-dm-sans text-sm font-semibold text-zinc-950">Imágenes del producto</p>
          <p className="mt-1 max-w-xl font-dm-sans text-sm leading-6 text-zinc-500">
            Agrega hasta 5 imágenes. Usa JPG, PNG o WebP de hasta 5 MB; recomendamos 1200 ×
            1200 px para una presentación nítida.
          </p>
          <p className="mt-2 font-dm-sans text-xs text-zinc-400">
            Arrastra las imágenes para cambiar su orden.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 font-dm-sans text-xs font-medium text-zinc-600">
          {images.length}/{MAX_PRODUCT_IMAGES}
        </span>
      </div>

      <ul className="grid list-none grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {images.map((image, index) => (
          <li
            key={image.key}
            data-image-index={index}
            onPointerDown={(event) => onPointerDown(event, index)}
            onPointerMove={onPointerMove}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              onPointerEnd();
            }}
            onPointerCancel={onPointerEnd}
            className={`group relative overflow-hidden rounded-md border bg-zinc-50 transition ${
              draggedIndex === index
                ? "touch-none scale-[0.98] border-zinc-500 ring-2 ring-zinc-950/10"
                : "touch-pan-y border-zinc-200"
            }`}
          >
            <div className="relative aspect-square">
              {image.type === "existing" ? (
                <Image
                  src={image.secure_url}
                  alt={`Imagen ${index + 1} de ${productName || "producto"}`}
                  fill
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
                  className="object-cover"
                />
              ) : (
                <LocalImagePreview
                  file={image.file}
                  alt={`Imagen ${index + 1} de ${productName || "producto"}`}
                />
              )}
            </div>
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onRemove(image.key)}
              className="absolute right-2 top-2 z-10 flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
              aria-label={`Eliminar imagen ${index + 1}`}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-zinc-950/75 px-2 py-1.5 text-white">
              <GripVertical aria-hidden="true" className="size-4" />
              <span className="font-dm-sans text-xs font-medium">
                {index === 0 ? "Principal" : index + 1}
              </span>
            </div>
          </li>
        ))}

        {images.length < MAX_PRODUCT_IMAGES && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-center transition-colors hover:border-zinc-500 hover:bg-zinc-100">
              <ImagePlus aria-hidden="true" className="size-5 text-zinc-500" />
              <span className="font-dm-sans text-xs font-medium text-zinc-600">
                Agregar imagen
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  onSelect(event.target.files);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
          </li>
        )}
      </ul>

      {uploadError && (
        <p role="alert" className="mt-3 font-dm-sans text-sm text-red-600">
          {uploadError}
        </p>
      )}
    </section>
  );
}
