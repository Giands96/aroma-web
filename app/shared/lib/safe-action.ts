import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient({

  handleServerError(error) {
    console.error("Server Action failed:", error);
    return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.";
  },
});