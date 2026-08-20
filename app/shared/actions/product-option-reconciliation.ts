interface ExistingOption {
  id: string;
}

interface IncomingOption {
  id?: string;
  activo: boolean;
}

export function assertValidProductOptionReconciliation(
  existingOptions: ExistingOption[],
  incomingOptions: IncomingOption[]
) {
  const existingIds = new Set(existingOptions.map((option) => option.id));
  const incomingIds = incomingOptions.flatMap((option) => option.id ? [option.id] : []);

  if (new Set(incomingIds).size !== incomingIds.length) {
    throw new Error("Received a duplicate product option ID.");
  }

  if (incomingIds.some((id) => !existingIds.has(id))) {
    throw new Error("Received an option that does not belong to this product.");
  }
}

export function assertActiveProductHasOption(
  productIsActive: boolean,
  options: Array<{ activo: boolean }>
) {
  if (productIsActive && !options.some((option) => option.activo)) {
    throw new Error("An active product requires an active option.");
  }
}
