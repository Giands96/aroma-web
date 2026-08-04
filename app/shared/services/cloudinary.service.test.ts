import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  config: vi.fn(),
  uploadStream: vi.fn(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    config: mocks.config,
    uploader: {
      upload_stream: mocks.uploadStream,
    },
  },
}));

import { uploadImageToCloudinary } from "./cloudinary.service";

describe("cloudinary service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.CLOUDINARY_URL = "cloudinary://key:secret@example";
  });

  it("reloads configuration from CLOUDINARY_URL before uploading", async () => {
    const stream = { end: vi.fn() };
    mocks.uploadStream.mockImplementation((_options, callback) => {
      callback(null, {
        public_id: "aroma/products/vela-aurora",
        secure_url: "https://res.cloudinary.com/example/vela-aurora.jpg",
      });
      return stream;
    });

    await expect(
      uploadImageToCloudinary({
        buffer: Buffer.from("image"),
        mime: "image/png",
        extension: "png",
        width: 100,
        height: 100,
      })
    ).resolves.toEqual({
      publicId: "aroma/products/vela-aurora",
      secureUrl: "https://res.cloudinary.com/example/vela-aurora.jpg",
    });

    expect(mocks.config).toHaveBeenCalledWith(true);
    expect(stream.end).toHaveBeenCalledWith(Buffer.from("image"));
  });

  it("returns Cloudinary failures as actionable errors", async () => {
    const stream = { end: vi.fn() };
    mocks.uploadStream.mockImplementation((_options, callback) => {
      callback({ message: "Cloudinary upload failed" }, null);
      return stream;
    });

    const result = uploadImageToCloudinary({
      buffer: Buffer.from("image"),
      mime: "image/png",
      extension: "png",
      width: 100,
      height: 100,
    });

    await expect(result).rejects.toBeInstanceOf(Error);
    await expect(result).rejects.toThrow("Cloudinary upload failed");
  });
});
