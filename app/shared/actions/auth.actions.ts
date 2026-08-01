"use server"

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionClient } from "../lib/safe-action";
import { signInWithEmail, signOut } from "../services/auth.service";

const loginSchema = z.object({
    email: z.string().email("El correo electrónico no es válido."),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const loginAction = actionClient
  .inputSchema(loginSchema)
  .action(async ({ parsedInput }) => {
    await signInWithEmail(
      parsedInput.email,
      parsedInput.password
    );
    redirect("/dashboard");
  });

export const logoutAction = actionClient.action(async () => {
  await signOut();
  redirect("/login");
});