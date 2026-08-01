import { describe, expect, it } from "vitest";
import { assertValidPackReconciliation } from "./pack-reconciliation";

describe("assertValidPackReconciliation", () => {
  const existingPacks = [{ id: "pack-a" }, { id: "pack-b" }];

  it("accepts existing IDs and new packs without IDs", () => {
    expect(() =>
      assertValidPackReconciliation(existingPacks, [
        { id: "pack-a" },
        {},
      ])
    ).not.toThrow();
  });

  it("rejects a pack ID that belongs to another product", () => {
    expect(() =>
      assertValidPackReconciliation(existingPacks, [{ id: "other-product-pack" }])
    ).toThrow("does not belong to this product");
  });

  it("rejects duplicated pack IDs in one update", () => {
    expect(() =>
      assertValidPackReconciliation(existingPacks, [
        { id: "pack-a" },
        { id: "pack-a" },
      ])
    ).toThrow("duplicate pack ID");
  });
});
