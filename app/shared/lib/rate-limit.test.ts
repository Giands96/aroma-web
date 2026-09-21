import { describe, expect, it, vi } from "vitest";
import {
  RateLimitedError,
  checkAdminWriteRateLimit,
  checkLoginRateLimit,
  checkLoginPageRateLimit,
  checkRateLimit,
  getClientIp,
  type Limiter,
} from "./rate-limit";

function headers(ip?: string): Headers | undefined {
  if (!ip) return undefined;
  return new Headers({ "x-forwarded-for": `${ip}, 10.0.0.1` });
}

function allowLimiter(): Limiter & { limit: ReturnType<typeof vi.fn> } {
  return {
    limit: vi.fn(async () => ({ success: true, reset: Date.now() + 1000 })),
  };
}

function denyLimiter(): Limiter & { limit: ReturnType<typeof vi.fn> } {
  return {
    limit: vi.fn(async () => ({ success: false, reset: Date.now() + 45_000 })),
  };
}

describe("getClientIp", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    expect(getClientIp(headers("1.2.3.4"))).toBe("1.2.3.4");
  });

  it("devuelve unknown sin headers", () => {
    expect(getClientIp(undefined)).toBe("unknown");
  });
});

describe("checkRateLimit", () => {
  it("fail-open sin limiter configurado (dev sin env)", async () => {
    await expect(checkRateLimit(null, "k", "login")).resolves.toBeUndefined();
  });

  it("deja pasar cuando hay cupo", async () => {
    const limiter = allowLimiter();
    await expect(checkRateLimit(limiter, "k", "login")).resolves.toBeUndefined();
    expect(limiter.limit).toHaveBeenCalledWith("k");
  });

  it("tira RateLimitedError con retry cuando no hay cupo", async () => {
    const limiter = denyLimiter();
    const error = await checkRateLimit(limiter, "k", "login").catch(
      (err: unknown) => err,
    );
    expect(error).toBeInstanceOf(RateLimitedError);
    expect((error as RateLimitedError).retryAfterSeconds).toBeGreaterThan(0);
    expect((error as Error).message).toContain("Demasiados intentos");
  });

  it("fail-open si Redis falla en runtime", async () => {
    const limiter: Limiter = {
      limit: vi.fn(async () => {
        throw new Error("boom");
      }),
    };
    await expect(checkRateLimit(limiter, "k", "login")).resolves.toBeUndefined();
  });
});

describe("limiters", () => {
  it("login: key por IP+email normalizado y tira al 6to intento", async () => {
    const limiter = denyLimiter();
    const error = await checkLoginRateLimit(
      headers("9.9.9.9"),
      " Admin@X.com ",
      limiter,
    ).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(RateLimitedError);
    expect(limiter.limit).toHaveBeenCalledWith("login:9.9.9.9:admin@x.com");
  });

  it("admin-write: key por IP+userId", async () => {
    const limiter = denyLimiter();
    const error = await checkAdminWriteRateLimit(
      headers("9.9.9.9"),
      "user-1",
      limiter,
    ).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(RateLimitedError);
    expect(limiter.limit).toHaveBeenCalledWith("admin-write:9.9.9.9:user-1");
  });

  it("login-page: key por IP", async () => {
    const limiter = allowLimiter();
    await checkLoginPageRateLimit(new Headers({ "x-real-ip": "5.5.5.5" }), limiter);
    expect(limiter.limit).toHaveBeenCalledWith("login-page:5.5.5.5");
  });
});
