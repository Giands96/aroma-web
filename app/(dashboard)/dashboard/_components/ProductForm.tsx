"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GripVertical, ImagePlus, X } from "lucide-react";
import { createProductAction, updateProductAction } from "@/app/shared/actions/products.actions";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import { MAX_PRODUCT_IMAGES } from "@/app/shared/lib/validations/product-image.schema";
import type { Product } from "@/app/shared/types/product.types";

interface ProductFormProps {
  product?: Product;
}

interface OptionDraft {
  id?: string;
  nombre: string;
  cantidad: string;
  precio: string;
  activo: boolean;
}

type ImageDraft =
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
      preview_url: string;
    };

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [nombre, setNombre] = useState(product?.nombre ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [descripcion, setDescripcion] = useState(product?.descripcion ?? "");
  const [activo, setActivo] = useState(product?.activo ?? true);
  const [options, setOptions] = useState<OptionDraft[]>(
    product?.product_options?.length
      ? product.product_options.map((o) => ({
          id: o.id,
          nombre: o.nombre,
          cantidad: String(o.cantidad),
          precio: String(o.precio),
          activo: o.activo,
        }))
      : [{ nombre: "", cantidad: "1", precio: "", activo: true }]
  );
  const [images, setImages] = useState<ImageDraft[]>(() =>
    getProductImages(product ?? {}).map((image) => ({
      key: image.public_id,
      type: "existing" as const,
      public_id: image.public_id,
      secure_url: image.secure_url,
    }))
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const updateOption = (index: number, field: string, value: string | boolean) => {
    setOptions((prev) =>
      prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
    );
  };

  const addOption = () => {
    setOptions((prev) => [...prev, { nombre: "", cantidad: "1", precio: "", activo: true }]);
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImageTo = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= images.length) return;

    setImages((prev) => {
      const next = [...prev];
      const [movedImage] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedImage);
      return next;
    });
  };

  const handleImagePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggedIndex === null) return;

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-image-index]");
    const targetIndex = Number(target?.dataset.imageIndex);
    if (!Number.isInteger(targetIndex) || targetIndex === draggedIndex) return;

    moveImageTo(draggedIndex, targetIndex);
    setDraggedIndex(targetIndex);
  };

  const handleImagePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    index: number
  ) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedIndex(index);
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const image = prev.find((item) => item.key === key);
      if (image?.type === "local") URL.revokeObjectURL(image.preview_url);
      return prev.filter((item) => item.key !== key);
    });
  };

  const handleImageSelection = (fileList: FileList | null) => {
    if (!fileList) return;

    const availableSlots = MAX_PRODUCT_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, availableSlots);
    if (files.length === 0) {
      setUploadError(`Un producto puede tener como máximo ${MAX_PRODUCT_IMAGES} imágenes.`);
      return;
    }

    setUploadError(null);
    const localImages = files.map((file) => ({
      key: crypto.randomUUID(),
      type: "local" as const,
      file,
      preview_url: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...localImages]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const parsedOptions = options.map((o) => ({
      ...(o.id ? { id: o.id } : {}),
      nombre: o.nombre,
      cantidad: Number(o.cantidad),
      precio: Number(o.precio),
      activo: o.activo,
    }));

    const payload = {
      nombre,
      slug,
      descripcion,
      activo,
      options: parsedOptions,
       image_entries: images.map((image) =>
        image.type === "existing"
          ? { type: "existing" as const, public_id: image.public_id }
          : { type: "file" as const, file: image.file }
      ),
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction({ ...payload, id: product.id })
        : await createProductAction(payload);

      if (result?.serverError) {
        setServerError(result.serverError);
        return;
      }
      router.push("/dashboard/productos");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 font-dm-sans text-sm text-red-700">
          {serverError}
        </div>
      )}

      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <p className="font-dm-sans text-sm font-semibold text-zinc-950">Información general</p>
          <p className="mt-1 font-dm-sans text-sm text-zinc-500">
            Datos visibles en el catálogo y en el detalle del producto.
          </p>
        </div>

        <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-2.5 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60">
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-2.5 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
          />
          <p className="mt-1 font-dm-sans text-xs text-hard-brown/50">Solo minúsculas, números y guiones.</p>
        </div>

        <div>
          <label htmlFor="descripcion" className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60">
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            className="mt-2 block w-full resize-y rounded-sm border border-hard-brown/20 bg-white px-4 py-2.5 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="size-4 accent-hard-brown"
          />
          <span className="font-dm-sans text-sm text-hard-brown">Producto activo</span>
        </label>
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="font-dm-sans text-sm font-semibold text-zinc-950">Imágenes del producto</p>
            <p className="mt-1 max-w-xl font-dm-sans text-sm leading-6 text-zinc-500">
              Agrega hasta 5 imágenes. Usa JPG, PNG o WebP de hasta 5 MB; recomendamos
              1200 × 1200 px para una presentación nítida.
            </p>
            <p className="mt-2 font-dm-sans text-xs text-zinc-400">Arrastra las imágenes para cambiar su orden.</p>
          </div>
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 font-dm-sans text-xs font-medium text-zinc-600">
            {images.length}/{MAX_PRODUCT_IMAGES}
          </span>
        </div>

        <div role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((image, index) => (
            <div
              key={image.key}
              data-image-index={index}
              role="listitem"
              onPointerDown={(event) => handleImagePointerDown(event, index)}
              onPointerMove={handleImagePointerMove}
              onPointerUp={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                setDraggedIndex(null);
              }}
              onPointerCancel={() => setDraggedIndex(null)}
              className={`group relative overflow-hidden rounded-md border bg-zinc-50 transition ${
                draggedIndex === index
                  ? "touch-none scale-[0.98] border-zinc-500 ring-2 ring-zinc-950/10"
                  : "touch-pan-y border-zinc-200"
              }`}
            >
              <div className="relative aspect-square">
                <Image
                  src={image.type === "existing" ? image.secure_url : image.preview_url}
                  alt={`Imagen ${index + 1} de ${nombre || "producto"}`}
                  fill
                  unoptimized={image.type === "local"}
                  sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 20vw"
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => removeImage(image.key)}
                className="absolute right-2 top-2 z-10 flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow-sm transition-colors hover:bg-red-500 hover:text-white"
                aria-label={`Eliminar imagen ${index + 1}`}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-zinc-950/75 px-2 py-1.5 text-white">
                <GripVertical aria-hidden="true" className="size-4" />
                <span className="font-dm-sans text-xs font-medium">{index === 0 ? "Principal" : index + 1}</span>
              </div>
            </div>
          ))}

          {images.length < MAX_PRODUCT_IMAGES && (
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
                  handleImageSelection(event.target.files);
                  event.target.value = "";
                }}
                className="sr-only"
              />
            </label>
          )}
        </div>

        {uploadError && <p role="alert" className="mt-3 font-dm-sans text-sm text-red-600">{uploadError}</p>}
      </section>

      <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center justify-between">
          <h3 className="font-dm-sans text-sm font-semibold text-zinc-950">
            Opciones del producto
          </h3>
          <button
            type="button"
            onClick={addOption}
            className="rounded-md border border-zinc-200 px-3 py-2 font-dm-sans text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            + Agregar opción
          </button>
        </div>

        </div>

        <div className="space-y-3">
        {options.map((option, index) => (
          <div
            key={option.id ?? index}
            className="space-y-3 rounded-md border border-zinc-200 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-xs font-medium text-hard-brown/60">
                Opción {index + 1}
              </span>
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="font-dm-sans text-xs text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={`option-${index}-name`} className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60">
                  Nombre
                </label>
                <input
                  id={`option-${index}-name`}
                  type="text"
                  value={option.nombre}
                  onChange={(e) => updateOption(index, "nombre", e.target.value)}
                  required
                  className="mt-1 block w-full rounded-sm border border-hard-brown/20 bg-white px-3 py-2 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
                />
              </div>
              <div>
                <label htmlFor={`option-${index}-quantity`} className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60">
                  Cantidad
                </label>
                <input
                  id={`option-${index}-quantity`}
                  type="number"
                  value={option.cantidad}
                  onChange={(e) => updateOption(index, "cantidad", e.target.value)}
                  required
                  min={1}
                  max={99}
                  className="mt-1 block w-full rounded-sm border border-hard-brown/20 bg-white px-3 py-2 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
                />
              </div>
              <div>
                <label htmlFor={`option-${index}-price`} className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60">
                  Precio (S/.)
                </label>
                <input
                  id={`option-${index}-price`}
                  type="number"
                  value={option.precio}
                  onChange={(e) => updateOption(index, "precio", e.target.value)}
                  required
                  min={0}
                  step="0.01"
                  className="mt-1 block w-full rounded-sm border border-hard-brown/20 bg-white px-3 py-2 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
                />
              </div>
              <label className="flex items-end gap-2 pb-1">
                <input
                  type="checkbox"
                  checked={option.activo}
                  onChange={(e) => updateOption(index, "activo", e.target.checked)}
                  className="size-4 accent-hard-brown"
                />
                <span className="font-dm-sans text-xs text-hard-brown">Activa</span>
              </label>
            </div>
          </div>
        ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 border-t border-zinc-200 pt-5 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-zinc-950 px-5 py-2.5 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Guardando..." : product ? "Actualizar producto" : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isPending}
          className="rounded-md border border-zinc-200 px-5 py-2.5 font-dm-sans text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
