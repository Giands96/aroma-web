import { createSafeActionClient } from "next-safe-action";

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
    console.error("server_action_failed", sanitizeErrorMetadata(error));
    if (process.env.NODE_ENV === "development") {
      return error.message;
    }
    return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  },
});
