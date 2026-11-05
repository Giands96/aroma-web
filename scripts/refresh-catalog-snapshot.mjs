#!/usr/bin/env node

/**
 * Regenerates data/catalog.snapshot.json from Supabase.
 *
 * Best-effort by design: if Supabase is unreachable or the env vars are
 * missing, it logs a warning and exits successfully so `next build` never
 * fails because of a database outage. When it cannot refresh, the previously
 * committed snapshot stays in place and keeps powering the public fallback.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const ROOT = resolve(import.meta.dirname, "..");
const TARGET = resolve(ROOT, "data/catalog.snapshot.json");
const WHATSAPP_KEY = "principal";
const MAX_FEATURED_PRODUCTS = 3;

function logWarn(message) {
  console.warn(`[catalog-snapshot] ${message}`);
}

function loadEnvFile(fileName) {
  const filePath = resolve(ROOT, fileName);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = /^\s*([\w.-]+)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

function readPreviousSnapshot() {
  if (!existsSync(TARGET)) return null;
  try {
    return JSON.parse(readFileSync(TARGET, "utf8"));
  } catch {
    return null;
  }
}

function sameData(previous, next) {
  if (!previous) return false;
  return ["version", "products", "featuredProducts", "whatsappConfig"].every(
    (key) => JSON.stringify(previous[key]) === JSON.stringify(next[key]),
  );
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    logWarn("Supabase env vars are missing; keeping the existing snapshot.");
    return;
  }

  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const [productsResult, featuredResult, configResult] = await Promise.all([
    supabase
      .from("products")
      .select("*, product_options!inner(*)")
      .eq("activo", true)
      .eq("product_options.activo", true)
      .order("cantidad", {
        ascending: true,
        referencedTable: "product_options",
      })
      .order("created_at", { ascending: false }),
    supabase
      .from("featured_products")
      .select(
        "id, created_at, product_id, posicion, products!inner(slug, nombre, descripcion, imagen_public_id, imagen_url, imagenes, product_options!inner(precio))",
      )
      .eq("products.activo", true)
      .eq("products.product_options.activo", true)
      .order("posicion", { ascending: true })
      .order("cantidad", {
        ascending: true,
        referencedTable: "products.product_options",
      })
      .limit(MAX_FEATURED_PRODUCTS),
    supabase
      .from("whatsapp_config")
      .select("clave, telefono, mensaje_carrito, mensaje_producto")
      .eq("clave", WHATSAPP_KEY)
      .maybeSingle(),
  ]);

  for (const result of [productsResult, featuredResult, configResult]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const next = {
    version: 1,
    products: productsResult.data ?? [],
    featuredProducts: featuredResult.data ?? [],
    whatsappConfig: configResult.data ?? null,
  };

  const previous = readPreviousSnapshot();
  if (sameData(previous, next)) {
    console.log("[catalog-snapshot] unchanged");
    return;
  }

  const snapshot = { ...next, updatedAt: new Date().toISOString() };
  mkdirSync(dirname(TARGET), { recursive: true });
  writeFileSync(TARGET, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(
    `[catalog-snapshot] saved ${next.products.length} products and ${next.featuredProducts.length} featured rows`,
  );
}

main().catch((error) => {
  logWarn(`refresh failed: ${error instanceof Error ? error.message : error}`);
});
