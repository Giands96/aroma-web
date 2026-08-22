import type { OptionDraft } from "./product-option-drafts";

export type { OptionDraft } from "./product-option-drafts";

interface GeneralInfoSectionProps {
  nombre: string;
  slug: string;
  descripcion: string;
  activo: boolean;
  onNombreChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onDescripcionChange: (value: string) => void;
  onActivoChange: (value: boolean) => void;
}

export function GeneralInfoSection({
  nombre,
  slug,
  descripcion,
  activo,
  onNombreChange,
  onSlugChange,
  onDescripcionChange,
  onActivoChange,
}: GeneralInfoSectionProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <p className="font-dm-sans text-sm font-semibold text-zinc-950">Información general</p>
        <p className="mt-1 font-dm-sans text-sm text-zinc-500">
          Datos visibles en el catálogo y en el detalle del producto.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="nombre"
            className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60"
          >
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(event) => onNombreChange(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-2.5 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
          />
        </div>

        <div>
          <label
            htmlFor="slug"
            className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60"
          >
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            required
            pattern="[a-z0-9-]+"
            className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-2.5 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
          />
          <p className="mt-1 font-dm-sans text-xs text-hard-brown/50">
            Solo minúsculas, números y guiones.
          </p>
        </div>

        <div>
          <label
            htmlFor="descripcion"
            className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-hard-brown/60"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(event) => onDescripcionChange(event.target.value)}
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
            onChange={(event) => onActivoChange(event.target.checked)}
            className="size-4 accent-hard-brown"
          />
          <span className="font-dm-sans text-sm text-hard-brown">Producto activo</span>
        </label>
      </div>
    </section>
  );
}

interface ProductOptionsSectionProps {
  options: OptionDraft[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (
    index: number,
    field: keyof Omit<OptionDraft, "id" | "uiKey">,
    value: string | boolean
  ) => void;
}

export function ProductOptionsSection({
  options,
  onAdd,
  onRemove,
  onUpdate,
}: ProductOptionsSectionProps) {
  return (
    <section className="rounded-md border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="font-dm-sans text-sm font-semibold text-zinc-950">
          Opciones del producto
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-zinc-200 px-3 py-2 font-dm-sans text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          + Agregar opción
        </button>
      </div>

      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={option.uiKey} className="space-y-3 rounded-md border border-zinc-200 p-4">
            <div className="flex items-center justify-between">
              <span className="font-dm-sans text-xs font-medium text-hard-brown/60">
                Opción {index + 1}
              </span>
              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="font-dm-sans text-xs text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`option-${index}-name`}
                  className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60"
                >
                  Nombre
                </label>
                <input
                  id={`option-${index}-name`}
                  type="text"
                  value={option.nombre}
                  onChange={(event) => onUpdate(index, "nombre", event.target.value)}
                  required
                  className="mt-1 block w-full rounded-sm border border-hard-brown/20 bg-white px-3 py-2 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
                />
              </div>
              <div>
                <label
                  htmlFor={`option-${index}-quantity`}
                  className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60"
                >
                  Cantidad
                </label>
                <input
                  id={`option-${index}-quantity`}
                  type="number"
                  value={option.cantidad}
                  onChange={(event) => onUpdate(index, "cantidad", event.target.value)}
                  required
                  min={1}
                  max={99}
                  className="mt-1 block w-full rounded-sm border border-hard-brown/20 bg-white px-3 py-2 font-dm-sans text-sm text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
                />
              </div>
              <div>
                <label
                  htmlFor={`option-${index}-price`}
                  className="block font-dm-sans text-[0.7rem] font-medium text-hard-brown/60"
                >
                  Precio (S/.)
                </label>
                <input
                  id={`option-${index}-price`}
                  type="number"
                  value={option.precio}
                  onChange={(event) => onUpdate(index, "precio", event.target.value)}
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
                  onChange={(event) => onUpdate(index, "activo", event.target.checked)}
                  className="size-4 accent-hard-brown"
                />
                <span className="font-dm-sans text-xs text-hard-brown">Activa</span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
