import { describe, expect, it } from "vitest";
import {
  createInitialOptionDrafts,
  createNewOptionDraft,
} from "./product-option-drafts";

describe("product option drafts", () => {
  it("creates unique UI keys for each new option without assigning persisted IDs", () => {
    const initialDraft = createInitialOptionDrafts([])[0];
    const addedDraft = createNewOptionDraft();

    expect(initialDraft).toMatchObject({
      nombre: "",
      cantidad: "1",
      precio: "",
      activo: true,
    });
    expect("id" in initialDraft).toBe(false);
    expect("id" in addedDraft).toBe(false);
    expect(initialDraft.uiKey).not.toBe(addedDraft.uiKey);
  });

  it("uses persisted option IDs as UI keys for existing options", () => {
    const [draft] = createInitialOptionDrafts([
      {
        id: "option-123",
        nombre: "Large",
        cantidad: 3,
        precio: 19.5,
        activo: true,
      },
    ]);

    expect(draft).toEqual({
      uiKey: "option-123",
      id: "option-123",
      nombre: "Large",
      cantidad: "3",
      precio: "19.5",
      activo: true,
    });
  });
});
