import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting con Upstash Redis (fetch-based, funciona en Edge y Node).
 *
 * Diseño:
 * - Sin `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` el check deja
 *   pasar (fail-open) y loguea un warning una sola vez. Esto permite dev y
 *   tests sin Redis. En producción las vars SON obligatorias.
 * - Si Redis falla en runtime, también fail-open con error logueado:
 *   preferimos disponibilidad y bloquear la escritura igual queda RLS.
 * - El 429 real a nivel HTTP solo puede salir del Edge (`proxy.ts`);
 *   dentro de Server Actions se propaga como `RateLimitedError` y
 *   `safe-action.ts` lo convierte en mensaje visible en el form.
 */
export class RateLimitedError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super(
      `Demasiados intentos. Probá de nuevo en ${retryAfterSeconds} segundos.`,
    );
    this.name = "RateLimitedError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export interface LimitResult {
  success: boolean;
  reset: number;
}

export interface Limiter {
  limit: (key: string) => Promise<LimitResult>;
}

type SlidingWindow = Parameters<typeof Ratelimit.slidingWindow>[1];

const LOGIN_LIMIT = { max: 5, window: "60 s" } as const;
const ADMIN_WRITE_LIMIT = { max: 30, window: "60 s" } as const;
const LOGIN_PAGE_LIMIT = { max: 20, window: "60 s" } as const;

let redisClient: Redis | null | undefined;
let warnedDisabled = false;

export function isRateLimitConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
      process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

/** Null cuando no hay env (dev/tests) -> los checks dejan pasar. */
function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  redisClient = isRateLimitConfigured() ? Redis.fromEnv() : null;
  return redisClient;
}

function buildLimiter(
  prefix: string,
  max: number,
  window: SlidingWindow,
): Limiter | null {
  const redis = getRedis();
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(max, window),
    prefix,
  });
}

export function getLoginLimiter(): Limiter | null {
  return buildLimiter("ratelimit:login", LOGIN_LIMIT.max, LOGIN_LIMIT.window);
}

export function getAdminWriteLimiter(): Limiter | null {
  return buildLimiter(
    "ratelimit:admin-write",
    ADMIN_WRITE_LIMIT.max,
    ADMIN_WRITE_LIMIT.window,
  );
}

export function getLoginPageLimiter(): Limiter | null {
  return buildLimiter(
    "ratelimit:login-page",
    LOGIN_PAGE_LIMIT.max,
    LOGIN_PAGE_LIMIT.window,
  );
}

/** IP del cliente desde headers de proxy/CDN. Nunca tira. */
export function getClientIp(requestHeaders?: Headers): string {
  const forwarded = requestHeaders?.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = requestHeaders?.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function checkRateLimit(
  limiter: Limiter | null,
  key: string,
  scope: string,
): Promise<void> {
  if (!limiter) {
    if (!warnedDisabled) {
      warnedDisabled = true;
      console.warn("rate_limit_disabled", { scope });
    }
    return;
  }

  let result: LimitResult;
  try {
    result = await limiter.limit(key);
  } catch (error) {
    console.error("rate_limit_backend_failed", {
      scope,
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return;
  }

  if (!result.success) {
    const retryAfter = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000),
    );
    throw new RateLimitedError(retryAfter);
  }
}

/** 5 intentos/min por IP+email. Llamar ANTES de `signInWithPassword`. */
export async function checkLoginRateLimit(
  requestHeaders: Headers | undefined,
  email: string,
  limiter: Limiter | null = getLoginLimiter(),
): Promise<void> {
  const key = `login:${getClientIp(requestHeaders)}:${email.toLowerCase().trim()}`;
  await checkRateLimit(limiter, key, "login");
}

/** 30 escrituras/min por IP+admin. Corre dentro de `adminActionClient`. */
export async function checkAdminWriteRateLimit(
  requestHeaders: Headers | undefined,
  userId: string,
  limiter: Limiter | null = getAdminWriteLimiter(),
): Promise<void> {
  const key = `admin-write:${getClientIp(requestHeaders)}:${userId}`;
  await checkRateLimit(limiter, key, "admin-write");
}

/** 20 cargas/min de /login por IP, para el Edge (`proxy.ts`). */
export async function checkLoginPageRateLimit(
  requestHeaders: Headers,
  limiter: Limiter | null = getLoginPageLimiter(),
): Promise<void> {
  const key = `login-page:${getClientIp(requestHeaders)}`;
  await checkRateLimit(limiter, key, "login-page");
}
