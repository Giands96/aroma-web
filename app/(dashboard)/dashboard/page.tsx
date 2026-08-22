import { getAllProducts } from "@/app/shared/services/products.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";
import Link from "next/link";
import { Package, Settings, Plus } from "lucide-react";
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
        <p className="mt-1 font-dm-sans text-sm text-zinc-500">
          Bienvenido{user?.email ? `, ${user.email}` : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={ROUTES.DASHBOARD.PRODUCTS}
          className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
              <Package aria-hidden="true" className="size-5 text-zinc-700" />
            </div>
            <div>
              <p className="font-dm-sans text-sm font-medium text-zinc-950">
                Productos
              </p>
              <p className="font-dm-sans text-xs text-zinc-500">
                {activeProducts} activos de {products.length}
              </p>
            </div>
          </div>
        </Link>

        <Link
          href={ROUTES.DASHBOARD.CONFIGURATION}
          className="block rounded-lg border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-zinc-100">
              <Settings aria-hidden="true" className="size-5 text-zinc-700" />
            </div>
            <div>
              <p className="font-dm-sans text-sm font-medium text-zinc-950">
                Configuración
              </p>
              <p className="font-dm-sans text-xs text-zinc-500">
                WhatsApp y límites
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-dm-sans text-sm font-medium text-zinc-950">
              Acceso rápido
            </h2>
            <p className="mt-1 font-dm-sans text-xs text-zinc-500">
              Crear un nuevo producto
            </p>
          </div>
          <Link
            href={ROUTES.DASHBOARD.NEW_PRODUCT}
            className="flex min-h-11 items-center gap-2 rounded-md bg-zinc-950 px-4 py-2 font-dm-sans text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nuevo
          </Link>
        </div>
      </div>
    </div>
  );
}
