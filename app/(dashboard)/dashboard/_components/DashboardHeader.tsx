"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Home, Package, Settings, Star, LogOut } from "lucide-react";
import { logoutAction } from "@/app/shared/actions/auth.actions";
import { ROUTES } from "@/app/shared/routes/routes";

const navItems = [
  { href: ROUTES.DASHBOARD.HOME, label: "Inicio", icon: Home },
  { href: ROUTES.DASHBOARD.PRODUCTS, label: "Productos", icon: Package },
  { href: ROUTES.DASHBOARD.FEATURED, label: "Destacados", icon: Star },
  { href: ROUTES.DASHBOARD.CONFIGURATION, label: "Configuración", icon: Settings },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const { execute: executeLogout, isExecuting } = useAction(logoutAction);

  return (
    <>
      {/* Mobile top bar — marca + salida (en móvil no hay sidebar) */}
      <header className="sticky top-0 z-40 flex min-h-14 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur md:hidden">
        <Link
          href={ROUTES.DASHBOARD.HOME}
          className="font-mileast text-lg text-zinc-950"
        >
          Aroma
        </Link>
        <button
          type="button"
          onClick={() => executeLogout()}
          disabled={isExecuting}
          aria-label="Cerrar sesión"
          className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut aria-hidden="true" className="size-5" />
        </button>
      </header>

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <Link
            href={ROUTES.DASHBOARD.HOME}
            className="font-mileast text-xl text-zinc-950"
          >
            Aroma
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 font-dm-sans text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-100 font-medium text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
                }`}
              >
                <item.icon aria-hidden="true" className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 px-3 py-3">
          <button
            type="button"
            onClick={() => executeLogout()}
            disabled={isExecuting}
            className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 font-dm-sans text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut aria-hidden="true" className="size-5" />
            {isExecuting ? "Cerrando..." : "Cerrar sesión"}
          </button>
        </div>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 font-dm-sans text-xs transition-colors ${
                isActive ? "font-medium text-zinc-950" : "text-zinc-500"
              }`}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute top-0 h-0.5 w-10 rounded-full bg-zinc-950"
                />
              )}
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
