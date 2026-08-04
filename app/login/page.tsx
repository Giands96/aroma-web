"use client";

import { useAction } from "next-safe-action/hooks";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/shared/actions/auth.actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { execute, result, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data.success) {
        router.replace("/dashboard");
      }
    },
  });

  const actionError =
    result.data && !result.data.success ? result.data.error : undefined;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    execute({ email, password });
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#FCFAF7] px-6 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6"
      >
        <div className="text-center">
          <h1 className="font-mileast text-3xl text-hard-brown">
            Panel Administrativo
          </h1>
          <p className="mt-2 font-dm-sans text-sm text-hard-brown/60">
            Ingresa con tu cuenta de administrador
          </p>
        </div>

        {(actionError || result.serverError || result.validationErrors) && (
          <div
            role="alert"
            className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 font-dm-sans text-sm text-red-700"
          >
            {actionError || result.serverError}
            {result.validationErrors?.email?._errors?.[0]}
            {result.validationErrors?.password?._errors?.[0]}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-hard-brown/60"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-3 font-dm-sans text-base text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block font-dm-sans text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-hard-brown/60"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-3 font-dm-sans text-base text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isExecuting}
          className="w-full rounded-sm bg-hard-brown px-6 py-3 font-dm-sans text-sm uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExecuting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
