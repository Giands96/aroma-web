"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/app/shared/actions/products.actions";
import { getProductImages } from "@/app/shared/lib/utils/product-images";
import { MAX_PRODUCT_IMAGES } from "@/app/shared/lib/validations/product-image.schema";
import type { Product } from "@/app/shared/types/product.types";
import {
  GeneralInfoSection,
  ProductOptionsSection,
  type OptionDraft,
} from "./ProductFormFields";
import { ProductImagesSection, type ImageDraft } from "./ProductImagesSection";

interface ProductFormProps {
  product?: Product;
}

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
      ? product.product_options.map((option) => ({
          id: option.id,
          nombre: option.nombre,
          cantidad: String(option.cantidad),
          precio: String(option.precio),
          activo: option.activo,
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

  const updateOption = (
    index: number,
    field: keyof Omit<OptionDraft, "id">,
    value: string | boolean
  ) => {
    setOptions((previousOptions) =>
      previousOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option
      )
    );
  };

  const addOption = () => {
    setOptions((previousOptions) => [
      ...previousOptions,
      { nombre: "", cantidad: "1", precio: "", activo: true },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions((previousOptions) =>
      previousOptions.filter((_, optionIndex) => optionIndex !== index)
    );
  };

  const moveImageTo = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || toIndex < 0 || toIndex >= images.length) return;

    setImages((previousImages) => {
      const nextImages = [...previousImages];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);
      return nextImages;
    });
  };

  const handleImagePointerMove = (event: React.PointerEvent<HTMLLIElement>) => {
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
    event: React.PointerEvent<HTMLLIElement>,
    index: number
  ) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggedIndex(index);
  };

  const removeImage = (key: string) => {
    setImages((previousImages) => previousImages.filter((item) => item.key !== key));
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
    }));
    setImages((previousImages) => [...previousImages, ...localImages]);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);

    const payload = {
      nombre,
      slug,
      descripcion,
      activo,
      options: options.map((option) => ({
        ...(option.id ? { id: option.id } : {}),
        nombre: option.nombre,
        cantidad: Number(option.cantidad),
        precio: Number(option.precio),
        activo: option.activo,
      })),
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
        <div
          role="alert"
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 font-dm-sans text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <GeneralInfoSection
        nombre={nombre}
        slug={slug}
        descripcion={descripcion}
        activo={activo}
        onNombreChange={setNombre}
        onSlugChange={setSlug}
        onDescripcionChange={setDescripcion}
        onActivoChange={setActivo}
      />

      <ProductImagesSection
        images={images}
        productName={nombre}
        draggedIndex={draggedIndex}
        uploadError={uploadError}
        onPointerDown={handleImagePointerDown}
        onPointerMove={handleImagePointerMove}
        onPointerEnd={() => setDraggedIndex(null)}
        onRemove={removeImage}
        onSelect={handleImageSelection}
      />

      <ProductOptionsSection
        options={options}
        onAdd={addOption}
        onRemove={removeOption}
        onUpdate={updateOption}
      />

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
