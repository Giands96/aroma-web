// Interfaz para representar un pack existente que siempre tiene un ID.
interface ExistingPack {
  id: string;
}
// Interfaz para representar un pack entrante que puede o no tener un ID.
interface IncomingPack {
  id?: string;
}

export function assertValidPackReconciliation(
  existingPacks: ExistingPack[],
  incomingPacks: IncomingPack[]
) {
  const existingIds = new Set(existingPacks.map((pack) => pack.id));
  const incomingIds = incomingPacks.flatMap((pack) => (pack.id ? [pack.id] : []));

  if (new Set(incomingIds).size !== incomingIds.length) {
    throw new Error("Received a duplicate pack ID.");
  }

  if (incomingIds.some((id) => !existingIds.has(id))) {
    throw new Error("Received a pack that does not belong to this product.");
  }
}
