import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mocks.getUser },
  })),
}));

import { updateSession } from "./proxy";

function request(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("Supabase auth proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
  });

  it("redirects unauthenticated dashboard requests to login", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await updateSession(request("/dashboard/productos/nuevo"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login"
    );
  });

  it("redirects authenticated login requests to the dashboard", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-id" } },
      error: null,
    });

    const response = await updateSession(request("/login"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/dashboard"
    );
  });

  it("does not redirect an authenticated authorization error back to dashboard", async () => {
    mocks.getUser.mockResolvedValue({
      data: { user: { id: "user-id" } },
      error: null,
    });

    const response = await updateSession(request("/login?error=admin"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("allows public requests without a user", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await updateSession(request("/coleccion"));

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
