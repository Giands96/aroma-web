import FeaturedProductsManager from "./FeaturedProductsManager";
import {
  getConfiguredFeaturedProducts,
  getProducts,
} from "@/app/shared/services/products.service";

export default async function FeaturedProductsPage() {
  const [configuredFeaturedProducts, products] = await Promise.all([
    getConfiguredFeaturedProducts(),
    getProducts(),
  ]);
  const featuredProductIds = new Set(
    configuredFeaturedProducts.map((featuredProduct) => featuredProduct.product_id)
  );
  const availableProducts = products.reduce<Array<{ id: string; nombre: string }>>(
    (available, { id, nombre }) => {
      if (!featuredProductIds.has(id)) {
        available.push({ id, nombre });
      }
      return available;
    },
    []
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="font-dm-sans text-sm font-medium text-zinc-500">
          Gestión de colección
        </p>
        <h1 className="mt-1 font-dm-sans text-2xl font-semibold tracking-tight text-zinc-950">
          Productos destacados
        </h1>
        <p className="mt-1 max-w-2xl font-dm-sans text-sm text-zinc-500">
          Elige los productos activos que se mostrarán primero en la colección.
        </p>
      </div>

      <FeaturedProductsManager
        featuredProducts={configuredFeaturedProducts}
        availableProducts={availableProducts}
      />
    </div>
  );
}
