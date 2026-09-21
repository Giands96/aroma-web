import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  updateSession: vi.fn(),
  checkLoginPageRateLimit: vi.fn(),
}));

vi.mock("./app/shared/lib/supabase/proxy", () => ({
  updateSession: mocks.updateSession,
}));

vi.mock("./app/shared/lib/rate-limit", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./app/shared/lib/rate-limit")>();
  return {
    ...actual,
    checkLoginPageRateLimit: mocks.checkLoginPageRateLimit,
  };
});

import { RateLimitedError } from "./app/shared/lib/rate-limit";
import { proxy } from "./proxy";

function request(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe("proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("continues public requests without refreshing the Supabase session", async () => {
    const response = await proxy(request("/coleccion"));

    expect(mocks.updateSession).not.toHaveBeenCalled();
    expect(mocks.checkLoginPageRateLimit).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
  });

  it("refreshes the session on login page requests within the rate limit", async () => {
    mocks.checkLoginPageRateLimit.mockResolvedValueOnce(undefined);

    await proxy(request("/login"));

    expect(mocks.checkLoginPageRateLimit).toHaveBeenCalledOnce();
    expect(mocks.updateSession).toHaveBeenCalledOnce();
  });

  it("returns 429 with Retry-After when the login page rate limit is exceeded", async () => {
    mocks.checkLoginPageRateLimit.mockRejectedValueOnce(
      new RateLimitedError(30),
    );

    const response = await proxy(request("/login"));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("30");
    expect(mocks.updateSession).not.toHaveBeenCalled();
  });
});