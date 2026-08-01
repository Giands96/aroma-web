import { describe, expect, it } from "vitest";
import { validateImageBuffer } from "./image.schema";

const onePixelPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+qULo9wAAAABJRU5ErkJggg==",
  "base64"
);

describe("validateImageBuffer", () => {
  it("accepts a decodable PNG with an allowed binary signature", async () => {
    await expect(validateImageBuffer(onePixelPng)).resolves.toMatchObject({
      mime: "image/png",
      extension: "png",
    });
  });

  it("rejects text even if the caller claims it is a JPG", async () => {
    await expect(
      validateImageBuffer(Buffer.from("not an image"), "image/jpeg")
    ).rejects.toThrow("no es una imagen válida");
  });

  it("rejects a file whose declared MIME type differs from its binary signature", async () => {
    await expect(
      validateImageBuffer(onePixelPng, "image/jpeg")
    ).rejects.toThrow("tipo declarado no coincide");
  });
});
