import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/app/shared/lib/supabase/server", () => ({
  createAdminClient: mocks.createAdminClient,
}));

import { createProductImageUpload } from "./product-image-uploads.service";

describe("product image uploads service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("records the authenticated admin as the server-created upload owner", async () => {
    const imageUpload = {
      id: "11111111-1111-4111-8111-111111111111",
      public_id: "aroma/products/vela-aurora",
      secure_url: "https://res.cloudinary.com/example/image/upload/vela-aurora.jpg",
    };
    const query = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: imageUpload, error: null }),
    };
    query.insert.mockReturnValue(query);
    query.select.mockReturnValue(query);
    mocks.createAdminClient.mockReturnValue({ from: vi.fn(() => query) });

    await expect(
      createProductImageUpload(
        imageUpload.public_id,
        imageUpload.secure_url,
        "22222222-2222-4222-8222-222222222222"
      )
    ).resolves.toEqual(imageUpload);

    expect(query.insert).toHaveBeenCalledWith({
      public_id: imageUpload.public_id,
      secure_url: imageUpload.secure_url,
      created_by: "22222222-2222-4222-8222-222222222222",
    });
  });
});
