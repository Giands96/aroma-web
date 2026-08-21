"use client";

import { useAction } from "next-safe-action/hooks";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed } from "lucide-react";
import { loginAction } from "@/app/shared/actions/auth.actions";
import { ROUTES } from "@/app/shared/routes/routes";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { execute, result, isExecuting } = useAction(loginAction, {
    onSuccess: ({ data }) => {
      if (data.success) {
        router.replace(ROUTES.DASHBOARD.HOME);
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
          <h1 className="font-dm-sans font-bold text-3xl text-neutral-700">
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
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="block w-full rounded-sm border border-hard-brown/20 bg-white px-4 py-3 pr-12 font-dm-sans text-base text-hard-brown outline-none focus-visible:ring-2 focus-visible:ring-hard-brown"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-hard-brown/60 transition-colors hover:text-hard-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hard-brown"
              >
                {showPassword ? (
                  <EyeClosed aria-hidden="true" className="size-5" />
                ) : (
                  <Eye aria-hidden="true" className="size-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isExecuting}
          className="w-full rounded-sm bg-neutral-700 px-6 py-3 font-dm-sans text-sm uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExecuting ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
