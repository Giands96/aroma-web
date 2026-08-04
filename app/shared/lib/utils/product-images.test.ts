import { describe, expect, it } from "vitest";
import { getProductImages } from "./product-images";

describe("getProductImages", () => {
  it("returns the stored gallery in its existing order", () => {
    const gallery = [
      {
        public_id: "aroma/products/front",
        secure_url: "https://res.cloudinary.com/example/front.jpg",
      },
      {
        public_id: "aroma/products/detail",
        secure_url: "https://res.cloudinary.com/example/detail.jpg",
      },
    ];

    expect(
      getProductImages({
        imagenes: gallery,
        imagen_public_id: null,
        imagen_url: null,
      })
    ).toEqual(gallery);
  });

  it("falls back to the legacy image while old records are migrated", () => {
    expect(
      getProductImages({
        imagenes: [],
        imagen_public_id: "aroma/products/legacy",
        imagen_url: "https://res.cloudinary.com/example/legacy.jpg",
      })
    ).toEqual([
      {
        public_id: "aroma/products/legacy",
        secure_url: "https://res.cloudinary.com/example/legacy.jpg",
      },
    ]);
  });

  it("returns no image when neither the gallery nor legacy fields are usable", () => {
    expect(
      getProductImages({
        imagenes: [{ public_id: "invalid", secure_url: "not-a-url" }],
        imagen_public_id: null,
        imagen_url: null,
      })
    ).toEqual([]);
  });
});
