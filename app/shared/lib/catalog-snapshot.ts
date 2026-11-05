import rawSnapshot from "@/data/catalog.snapshot.json";
import type { FeaturedProduct, WhatsAppConfig } from "@/app/shared/types";
import type { Product } from "@/app/shared/types/product.types";

/**
 * Last known public catalog, read from a committed snapshot.
 *
 * It is the final fallback when Supabase is unreachable and Next's data
 * cache is cold (for example, a fresh deployment). It is refreshed by
 * `pnpm snapshot`; see scripts/refresh-catalog-snapshot.mjs.
 */
export interface CatalogSnapshotFile {
  version: number;
  updatedAt: string | null;
  products: Product[];
  featuredProducts: FeaturedProduct[];
  whatsappConfig: WhatsAppConfig | null;
}

const snapshot = rawSnapshot as unknown as CatalogSnapshotFile;

export function getSnapshotProducts(): Product[] {
  return Array.isArray(snapshot.products) ? snapshot.products : [];
}

export function getSnapshotProductsPage(
  page: number,
  pageSize: number,
): { products: Product[]; total: number } {
  const products = getSnapshotProducts();
  const start = (page - 1) * pageSize;
  return {
    products: products.slice(start, start + pageSize),
    total: products.length,
  };
}

export function getSnapshotProductBySlug(slug: string): Product | null {
  return getSnapshotProducts().find((product) => product.slug === slug) ?? null;
}

export function getSnapshotLatestProducts(limit: number): Product[] {
  return getSnapshotProducts().slice(0, limit);
}

export function getSnapshotFeaturedProducts(): FeaturedProduct[] {
  return Array.isArray(snapshot.featuredProducts) ? snapshot.featuredProducts : [];
}

export function getSnapshotWhatsAppConfig(): WhatsAppConfig | null {
  return snapshot.whatsappConfig ?? null;
}

/**
 * Logs a public read that had to fall back. Never throws and never includes
 * credentials: only the error message is kept for diagnostics.
 */
export function logPublicCatalogFallback(scope: string, error: unknown): void {
  console.error("public_catalog_fallback", {
    scope,
    message: error instanceof Error ? error.message : String(error),
  });
}
