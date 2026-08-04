import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("@/app/shared/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

import { requireAdmin } from "./require-admin";

describe("requireAdmin", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated users", async () => {
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: null,
        }),
      },
    });

    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("rejects authenticated users without admin membership", async () => {
    const user = { id: "user-id", email: "user@aroma.pe" };
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
      from: vi.fn(() => query),
    });

    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("allows authenticated users with admin membership", async () => {
    const user = { id: "user-id", email: "admin@aroma.pe" };
    const query = {
      select: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { user_id: user.id }, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
      from: vi.fn(() => query),
    });

    await expect(requireAdmin()).resolves.toEqual(user);
    expect(query.eq).toHaveBeenCalledWith("user_id", user.id);
  });
});
