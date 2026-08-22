"use server"

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionClient } from "../lib/safe-action";
import { signInWithEmail, signOut } from "../services/auth.service";
import { ROUTES } from "@/app/shared/routes/routes";

const loginSchema = z.object({
    email: z.email("El correo electrónico no es válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    try {
      await signInWithEmail(
        parsedInput.email,
        parsedInput.password
      );

      return { success: true };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.toLowerCase() === "invalid login credentials"
      ) {
        return {
          success: false,
          error: "El correo electrónico o la contraseña no son correctos.",
        };
      }

      throw error;
    }
  });

export const logoutAction = actionClient.action(async () => {
  await signOut();
  redirect(ROUTES.LOGIN);
});
