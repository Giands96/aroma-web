import { getAllProducts } from "@/app/shared/services/products.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";
import Link from "next/link";
import { Package, Settings, Plus, Star } from "lucide-react";
import { ROUTES } from "@/app/shared/routes/routes";

export default async function DashboardHomePage() {
  const [user, products] = await Promise.all([
    getCurrentUser(),
    getAllProducts(),
  ]);

  const activeProducts = products.filter((p) => p.activo).length;

  return (
    <div className="space-y-6">
      <div>
        <p className="font-dm-sans text-sm font-medium text-zinc-500">Resumen</p>
        <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">Dashboard</h1>
        <p className="mt-1 truncate font-dm-sans text-sm text-zinc-500">
          Bienvenido{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      {/* Acción primaria — primero en móvil, alcance del pulgar */}
      <Link
        href={ROUTES.DASHBOARD.NEW_PRODUCT}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-3 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800 sm:w-auto"
      >
        <Plus aria-hidden="true" className="size-4" />
        Nuevo producto
      </Link>

      {/* Estado del catálogo */}
      <Link
        href={ROUTES.DASHBOARD.PRODUCTS}
        className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
      >
        <div className="flex items-center gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <Package aria-hidden="true" className="size-5 text-zinc-700" />
          </div>
          <div className="min-w-0">
            <p className="font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">
              {activeProducts}
              <span className="ml-1 font-dm-sans text-sm font-normal text-zinc-500">
                de {products.length} activos
              </span>
            </p>
            <p className="truncate font-dm-sans text-xs text-zinc-500">
              Ver catálogo →
            </p>
          </div>
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.DASHBOARD.FEATURED}
          className="flex min-h-16 items-center gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <Star aria-hidden="true" className="size-5 text-zinc-700" />
          </div>
          <div className="min-w-0">
            <p className="font-dm-sans text-sm font-medium text-zinc-950">
              Destacados
            </p>
            <p className="truncate font-dm-sans text-xs text-zinc-500">
              Orden del home
            </p>
          </div>
        </Link>

        <Link
          href={ROUTES.DASHBOARD.CONFIGURATION}
          className="flex min-h-16 items-center gap-3 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-zinc-100">
            <Settings aria-hidden="true" className="size-5 text-zinc-700" />
          </div>
          <div className="min-w-0">
            <p className="font-dm-sans text-sm font-medium text-zinc-950">
              Configuración
            </p>
            <p className="truncate font-dm-sans text-xs text-zinc-500">
              WhatsApp y límites
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
