import { describe, expect, it } from "vitest";
import {
  MAX_PRODUCT_IMAGES,
  productImageEntriesSchema,
  productImagesSchema,
} from "./product-image.schema";

const image = {
  public_id: "aroma/products/vela-aurora",
  secure_url: "https://res.cloudinary.com/example/image/upload/vela-aurora.jpg",
};

describe("product image schemas", () => {
  it("accepts a product gallery with at most five images", () => {
    expect(
      productImagesSchema.parse(
        Array.from({ length: MAX_PRODUCT_IMAGES }, (_, index) => ({
          ...image,
          public_id: `${image.public_id}-${index}`,
        }))
      )
    ).toHaveLength(MAX_PRODUCT_IMAGES);
  });

  it("rejects a product gallery with more than five images", () => {
    expect(() =>
      productImagesSchema.parse(
        Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, index) => ({
          ...image,
          public_id: `${image.public_id}-${index}`,
        }))
      )
    ).toThrow();
  });

  it("accepts existing image references and local files", () => {
    expect(
      productImageEntriesSchema.parse([
        { type: "existing", public_id: image.public_id },
        {
          type: "file",
          file: new File(["image"], "vela.png", { type: "image/png" }),
        },
      ])
    ).toHaveLength(2);
  });

  it("rejects more than five image entries", () => {
    expect(() =>
      productImageEntriesSchema.parse(
        Array.from({ length: MAX_PRODUCT_IMAGES + 1 }, (_, index) => ({
          type: "existing",
          public_id: `${image.public_id}-${index}`,
        }))
      )
    ).toThrow();
  });
});
