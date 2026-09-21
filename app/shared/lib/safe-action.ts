import { createSafeActionClient } from "next-safe-action";
import { headers } from "next/headers";
import { requireAdmin } from "@/app/shared/actions/require-admin";
import {
  RateLimitedError,
  checkAdminWriteRateLimit,
} from "@/app/shared/lib/rate-limit";

type ErrorMetadata = {
  name: string;
  code?: string;
  status?: number;
  digest?: string;
};

export function sanitizeErrorMetadata(error: unknown): ErrorMetadata {
  if (typeof error !== "object" || error === null) {
    return { name: "UnknownError" };
  }

  const { name, code, status, digest } = error as Record<string, unknown>;

  return {
    name: typeof name === "string" ? name : "UnknownError",
    ...(typeof code === "string" ? { code } : {}),
    ...(typeof status === "number" ? { status } : {}),
    ...(typeof digest === "string" ? { digest } : {}),
  };
}

export const actionClient = createSafeActionClient({
  handleServerError(error: Error & { digest?: string }) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    if (error instanceof RateLimitedError) {
      return error.message;
    }
    console.error("server_action_failed", sanitizeErrorMetadata(error));
    if (process.env.NODE_ENV === "development") {
      return error.message;
    }
    return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  },
});

/**
 * Cliente para escrituras de admin: exige sesión admin + rate limit
 * (30/min por IP+usuario). Usarlo en TODA action que escriba.
 */
export const adminActionClient = actionClient.use(async ({ next }) => {
  const admin = await requireAdmin();

  let requestHeaders: Headers | undefined;
  try {
    requestHeaders = await headers();
  } catch {
    requestHeaders = undefined;
  }
  await checkAdminWriteRateLimit(requestHeaders, admin.id);

  return next({ ctx: { admin } });
});
