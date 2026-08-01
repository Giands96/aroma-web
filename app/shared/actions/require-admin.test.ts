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

  it("rejects unauthenticated action calls", async () => {
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    });

    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("rejects an authenticated user who is not in admin_users", async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-id" } }, error: null }) },
      from: vi.fn(() => query),
    });

    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("returns a user registered in admin_users", async () => {
    const user = { id: "admin-id", email: "admin@aroma.pe" };
    const maybeSingle = vi.fn().mockResolvedValue({ data: { user_id: user.id }, error: null });
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    mocks.createClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }) },
      from: vi.fn(() => query),
    });

    await expect(requireAdmin()).resolves.toEqual(user);
  });
});
