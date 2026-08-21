export interface OptionDraft {
  readonly uiKey: string;
  id?: string;
  nombre: string;
  cantidad: string;
  precio: string;
  activo: boolean;
}

interface ExistingOptionDraft {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  activo: boolean;
}

export function createNewOptionDraft(): OptionDraft {
  return {
    uiKey: crypto.randomUUID(),
    nombre: "",
    cantidad: "1",
    precio: "",
    activo: true,
  };
}

export function createInitialOptionDrafts(
  existingOptions: readonly ExistingOptionDraft[] | undefined
): OptionDraft[] {
  if (!existingOptions?.length) return [createNewOptionDraft()];

  return existingOptions.map((option) => ({
    uiKey: option.id,
    id: option.id,
    nombre: option.nombre,
    cantidad: String(option.cantidad),
    precio: String(option.precio),
    activo: option.activo,
  }));
}
