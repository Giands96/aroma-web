import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({
  handleServerError(error: Error & { digest?: string }) {
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Server Action failed:", error);
    if (process.env.NODE_ENV === "development") {
      return error.message;
    }
    return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  },
});
