"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { Home, Package, Settings, LogOut } from "lucide-react";
import { logoutAction } from "@/app/shared/actions/auth.actions";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/dashboard/productos", label: "Productos", icon: Package },
  { href: "/dashboard/configuracion", label: "Configuración", icon: Settings },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const { execute: executeLogout, isExecuting } = useAction(logoutAction);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-zinc-200 bg-white md:flex">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <Link
            href="/dashboard"
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
          <button
            type="button"
            onClick={() => executeLogout()}
            disabled={isExecuting}
            className="flex min-h-16 flex-1 cursor-pointer flex-col items-center justify-center gap-1 font-dm-sans text-xs text-zinc-500 transition-colors hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut aria-hidden="true" className="size-5" />
            {isExecuting ? "Saliendo..." : "Salir"}
          </button>
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
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-zinc-200 bg-white/95 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-16 flex-1 flex-col items-center justify-center gap-1 font-dm-sans text-xs transition-colors ${
                isActive ? "font-medium text-zinc-950" : "text-zinc-500"
              }`}
            >
              <item.icon aria-hidden="true" className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
