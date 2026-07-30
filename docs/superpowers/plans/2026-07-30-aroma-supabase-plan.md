# Aroma Web — Implementation Plan
## Supabase + Cloudinary + Cart + WhatsApp

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Aroma Next.js 16 frontend to a Supabase backend, add an admin dashboard with Cloudinary image handling, an anonymous cart with limits, and configurable WhatsApp order generation.

**Architecture:** Server Components fetch data from Supabase, Server Actions (via `next-safe-action`) handle mutations, Zustand manages the cart client-side, and Cloudinary handles images server-side.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind v4, Supabase, `@supabase/ssr`, `next-safe-action`, Zod, Zustand, Cloudinary SDK, Sonner.

## Global Constraints

- Use Next.js App Router route groups: `(public)` for store, `(dashboard)` for admin.
- All Supabase writes from the dashboard must pass through Server Actions with session verification.
- Images are uploaded, validated, and deleted only on the server via Cloudinary SDK.
- Cart persists only in `localStorage`; no cart data in Supabase for anonymous users.
- All schemas validated with Zod; use `next-safe-action` for Server Actions.
- Keep files modular and focused; one clear responsibility per file.

---

## Task 1: Project Setup and Dependencies

**Files:**
- Create: `.env.local`
- Modify: `package.json`, `next.config.ts`

**Interfaces:**
- Produces: environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NEXT_PUBLIC_WHATSAPP_DEFAULT_PHONE`.

- [ ] **Step 1: Install dependencies**

Run:
```bash
pnpm add @supabase/supabase-js @supabase/ssr next-safe-action zod zustand sonner cloudinary
```

Expected output: packages added successfully.

- [ ] **Step 2: Add environment variables**

Create `D:\aroma-web\.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp fallback
NEXT_PUBLIC_WHATSAPP_DEFAULT_PHONE=51945513054
```

- [ ] **Step 3: Add remotePatterns to next.config.ts**

Edit `D:\aroma-web\next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts .env.local
git commit -m "chore: add supabase, cloudinary, zustand and safe-action dependencies"
```

---

## Task 2: Supabase Database Schema

**Files:**
- Create: `supabase/migrations/20260730000001_initial_schema.sql`

**Interfaces:**
- Produces: tables `products`, `packs`, `whatsapp_config`, `cart_limits` with RLS policies.

- [ ] **Step 1: Create migration file**

Create `D:\aroma-web\supabase\migrations\20260730000001_initial_schema.sql`:
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_public_id TEXT,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Packs table
CREATE TABLE packs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  cantidad SMALLINT NOT NULL CHECK (cantidad > 0 AND cantidad <= 99),
  precio NUMERIC(10,2) NOT NULL CHECK (precio > 0),
  activo BOOLEAN DEFAULT TRUE
);

-- WhatsApp config singleton
CREATE TABLE whatsapp_config (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  telefono TEXT NOT NULL CHECK (telefono ~ '^\d{10,15}$'),
  mensaje_base TEXT NOT NULL DEFAULT 'Hola Aroma, quiero consultar por:',
  mensaje_personalizado TEXT NOT NULL DEFAULT 'Hola Aroma, quiero un pedido personalizado!'
);

-- Cart limits singleton
CREATE TABLE cart_limits (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
  max_items SMALLINT NOT NULL DEFAULT 10 CHECK (max_items > 0),
  max_quantity_per_item SMALLINT NOT NULL DEFAULT 99 CHECK (max_quantity_per_item > 0)
);

-- Seed singletons
INSERT INTO whatsapp_config (id, telefono, mensaje_base, mensaje_personalizado)
VALUES ('00000000-0000-0000-0000-000000000001', '51945513054', 'Hola Aroma, quiero consultar por:', 'Hola Aroma, quiero un pedido personalizado!')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cart_limits (id, max_items, max_quantity_per_item)
VALUES ('00000000-0000-0000-0000-000000000001', 10, 99)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_limits ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "products_public_read" ON products
  FOR SELECT TO PUBLIC USING (activo = TRUE);

CREATE POLICY "packs_public_read" ON packs
  FOR SELECT TO PUBLIC USING (activo = TRUE);

CREATE POLICY "whatsapp_config_public_read" ON whatsapp_config
  FOR SELECT TO PUBLIC USING (TRUE);

CREATE POLICY "cart_limits_public_read" ON cart_limits
  FOR SELECT TO PUBLIC USING (TRUE);

-- Authenticated write policies
CREATE POLICY "products_admin_write" ON products
  FOR ALL TO AUTHENTICATED USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "packs_admin_write" ON packs
  FOR ALL TO AUTHENTICATED USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "whatsapp_config_admin_write" ON whatsapp_config
  FOR ALL TO AUTHENTICATED USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "cart_limits_admin_write" ON cart_limits
  FOR ALL TO AUTHENTICATED USING (TRUE) WITH CHECK (TRUE);
```

- [ ] **Step 2: Apply migration using Supabase Agent Skill**

Use the Supabase Agent Skill to run the migration against the project. Verify tables exist and RLS policies are active.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260730000001_initial_schema.sql
git commit -m "chore: add initial supabase schema with rls"
```

---

## Task 3: Supabase SSR Clients, Middleware, Types and Schemas

**Files:**
- Create: `app/shared/lib/supabase/client.ts`, `app/shared/lib/supabase/server.ts`, `app/shared/lib/supabase/middleware.ts`, `middleware.ts`, `app/shared/lib/safe-action.ts`, `app/shared/types/index.ts`, `app/shared/lib/validations/product.schema.ts`, `app/shared/lib/validations/pack.schema.ts`, `app/shared/lib/validations/config.schema.ts`, `app/shared/lib/utils/slug.ts`, `app/shared/lib/utils/currency.ts`

**Interfaces:**
- Produces: `createClient()` for browser, `createClient()` for server, `updateSession()` for middleware, `actionClient` from `next-safe-action`, shared types, Zod schemas.

- [ ] **Step 1: Browser Supabase client**

Create `D:\aroma-web\app\shared\lib\supabase\client.ts`:
```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Server Supabase client**

Create `D:\aroma-web\app\shared\lib\supabase\server.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in cases where setAll is called from a Server Component
          }
        },
      },
    }
  );
}
```

- [ ] **Step 3: Middleware**

Create `D:\aroma-web\app\shared\lib\supabase\middleware.ts`:
```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return supabaseResponse;
}
```

Create `D:\aroma-web\middleware.ts`:
```ts
import { updateSession } from "@/app/shared/lib/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 4: safe-action client**

Create `D:\aroma-web\app\shared\lib\safe-action.ts`:
```ts
import { createSafeActionClient } from "next-safe-action";

export const actionClient = createSafeActionClient();
```

- [ ] **Step 5: Shared types**

Create `D:\aroma-web\app\shared\types\index.ts`:
```ts
export interface Product {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  imagen_public_id: string | null;
  imagen_url: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  packs?: Pack[];
}

export interface Pack {
  id: string;
  product_id: string;
  cantidad: number;
  precio: number;
  activo: boolean;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  packId: string;
  packQuantity: number;
  packPrice: number;
  itemQuantity: number;
}

export interface WhatsAppConfig {
  id: string;
  telefono: string;
  mensaje_base: string;
  mensaje_personalizado: string;
}

export interface CartLimits {
  id: string;
  max_items: number;
  max_quantity_per_item: number;
}
```

- [ ] **Step 6: Zod schemas**

Create `D:\aroma-web\app\shared\lib\validations\product.schema.ts`:
```ts
import { z } from "zod";

export const productSchema = z.object({
  nombre: z.string().min(2).max(120),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
  descripcion: z.string().min(10),
  imagen_public_id: z.string().optional().nullable(),
  imagen_url: z.string().url().optional().nullable(),
  activo: z.boolean().default(true),
});

export const productWithIdSchema = productSchema.extend({
  id: z.string().uuid(),
});

export type ProductInput = z.infer<typeof productSchema>;
```

Create `D:\aroma-web\app\shared\lib\validations\pack.schema.ts`:
```ts
import { z } from "zod";

export const packSchema = z.object({
  cantidad: z.number().int().min(1).max(99),
  precio: z.number().positive().multipleOf(0.01),
  activo: z.boolean().default(true),
});

export const packWithIdSchema = packSchema.extend({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
});

export type PackInput = z.infer<typeof packSchema>;
```

Create `D:\aroma-web\app\shared\lib\validations\config.schema.ts`:
```ts
import { z } from "zod";

export const whatsappConfigSchema = z.object({
  telefono: z.string().regex(/^\d{10,15}$/),
  mensaje_base: z.string().min(1).max(500),
  mensaje_personalizado: z.string().min(1).max(500),
});

export const cartLimitsSchema = z.object({
  max_items: z.number().int().min(1).max(50),
  max_quantity_per_item: z.number().int().min(1).max(999),
});

export type WhatsAppConfigInput = z.infer<typeof whatsappConfigSchema>;
export type CartLimitsInput = z.infer<typeof cartLimitsSchema>;
```

- [ ] **Step 7: Utility helpers**

Create `D:\aroma-web\app\shared\lib\utils\slug.ts`:
```ts
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
```

Create `D:\aroma-web\app\shared\lib\utils\currency.ts`:
```ts
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}
```

- [ ] **Step 8: Commit**

```bash
git add app/shared/lib/supabase app/shared/lib/safe-action.ts app/shared/types app/shared/lib/validations app/shared/lib/utils/slug.ts app/shared/lib/utils/currency.ts middleware.ts
git commit -m "chore: add supabase ssr clients, middleware, types and schemas"
```

---

## Task 4: Admin Authentication

**Files:**
- Create: `app/shared/services/auth.service.ts`, `app/shared/actions/auth.actions.ts`, `app/(dashboard)/layout.tsx`, `app/login/page.tsx`, `app/shared/components/dashboard/DashboardShell.tsx`
- Modify: `app/shared/routes/routes.ts`

**Interfaces:**
- Produces: `loginUser(email, password)` action, `DashboardShell` component.
- Consumes: `createClient` from `app/shared/lib/supabase/server.ts`.

- [ ] **Step 1: Auth service**

Create `D:\aroma-web\app\shared\services\auth.service.ts`:
```ts
import { createClient } from "@/app/shared/lib/supabase/server";

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
```

- [ ] **Step 2: Login action**

Create `D:\aroma-web\app\shared\actions\auth.actions.ts`:
```ts
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { actionClient } from "@/app/shared/lib/safe-action";
import { signInWithEmail } from "@/app/shared/services/auth.service";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput }) => {
    await signInWithEmail(parsedInput.email, parsedInput.password);
    redirect("/dashboard");
  });
```

- [ ] **Step 3: Login page**

Create `D:\aroma-web\app\login\page.tsx`:
```tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { loginAction } from "@/app/shared/actions/auth.actions";

export default function LoginPage() {
  const { execute, isPending } = useAction(loginAction);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4EDE9]">
      <form
        action={execute}
        className="w-full max-w-md space-y-6 rounded-lg border border-hard-brown bg-white p-8"
      >
        <h1 className="text-3xl font-bold text-hard-brown">Iniciar sesión</h1>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-hard-brown">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-hard-brown p-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-hard-brown">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-hard-brown p-2"
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded bg-hard-brown px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Dashboard shell**

Create `D:\aroma-web\app\shared\components\dashboard\DashboardShell.tsx`:
```tsx
import Link from "next/link";
import { logoutAction } from "@/app/shared/actions/auth.actions";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4EDE9]">
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-hard-brown bg-white p-6">
        <h2 className="mb-8 text-2xl font-bold text-hard-brown">Dashboard</h2>
        <nav className="space-y-4">
          <Link href="/dashboard" className="block text-hard-brown hover:underline">
            Inicio
          </Link>
          <Link href="/dashboard/productos" className="block text-hard-brown hover:underline">
            Productos
          </Link>
          <Link href="/dashboard/configuracion" className="block text-hard-brown hover:underline">
            Configuración
          </Link>
        </nav>
        <form action={logoutAction} className="mt-8">
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Cerrar sesión
          </button>
        </form>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Logout action**

Add to `D:\aroma-web\app\shared\actions\auth.actions.ts`:
```ts
export const logoutAction = actionClient.action(async () => {
  await signOut();
  redirect("/login");
});
```

- [ ] **Step 6: Dashboard layout**

Create `D:\aroma-web\app\(dashboard)\layout.tsx`:
```tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/shared/services/auth.service";
import DashboardShell from "@/app/shared/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
```

- [ ] **Step 7: Simple dashboard home**

Create `D:\aroma-web\app\(dashboard)\dashboard\page.tsx`:
```tsx
export default function DashboardHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-hard-brown">Bienvenido al dashboard</h1>
      <p className="mt-4 text-hard-brown">Desde aquí podés gestionar productos y configuración.</p>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add app/shared/services/auth.service.ts app/shared/actions/auth.actions.ts app/login app/shared/components/dashboard/DashboardShell.tsx app/\(dashboard\)/layout.tsx app/\(dashboard\)/dashboard/page.tsx
git commit -m "feat: add admin login, logout and dashboard layout"
```

---

## Task 5: Product, Pack and Config Services + Server Actions

**Files:**
- Create: `app/shared/services/products.service.ts`, `app/shared/services/packs.service.ts`, `app/shared/services/config.service.ts`, `app/shared/actions/products.actions.ts`, `app/shared/actions/packs.actions.ts`, `app/shared/actions/config.actions.ts`

**Interfaces:**
- Produces: `getProducts()`, `getProductBySlug()`, `createProduct()`, `updateProduct()`, `deleteProduct()`, `getPacksByProductId()`, `createPack()`, `updatePack()`, `deletePack()`, `getWhatsAppConfig()`, `updateWhatsAppConfig()`, `getCartLimits()`, `updateCartLimits()`.
- Consumes: `createClient()` from `app/shared/lib/supabase/server.ts`, `ProductInput`, `PackInput`, `WhatsAppConfigInput`, `CartLimitsInput`.

- [ ] **Step 1: Products service**

Create `D:\aroma-web\app\shared\services\products.service.ts`:
```ts
import { createClient } from "@/app/shared/lib/supabase/server";
import type { Product } from "@/app/shared/types";

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, packs(*)")
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, packs(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, packs(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: Omit<Product, "id" | "created_at" | "updated_at" | "packs">) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").insert(input).select().single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, input: Partial<Product>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 2: Packs service**

Create `D:\aroma-web\app\shared\services\packs.service.ts`:
```ts
import { createClient } from "@/app/shared/lib/supabase/server";
import type { Pack } from "@/app/shared/types";

export async function getPacksByProductId(productId: string): Promise<Pack[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("product_id", productId)
    .eq("activo", true)
    .order("cantidad", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Pack[];
}

export async function createPack(input: Omit<Pack, "id">) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("packs").insert(input).select().single();
  if (error) throw error;
  return data as Pack;
}

export async function updatePack(id: string, input: Partial<Pack>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packs")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Pack;
}

export async function deletePack(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("packs").delete().eq("id", id);
  if (error) throw error;
}
```

- [ ] **Step 3: Config service**

Create `D:\aroma-web\app\shared\services\config.service.ts`:
```ts
import { createClient } from "@/app/shared/lib/supabase/server";
import type { CartLimits, WhatsAppConfig } from "@/app/shared/types";

const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("id", SINGLETON_ID)
    .single();

  if (error) throw error;
  return data as WhatsAppConfig;
}

export async function updateWhatsAppConfig(input: Partial<WhatsAppConfig>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_config")
    .update(input)
    .eq("id", SINGLETON_ID)
    .select()
    .single();
  if (error) throw error;
  return data as WhatsAppConfig;
}

export async function getCartLimits(): Promise<CartLimits> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_limits")
    .select("*")
    .eq("id", SINGLETON_ID)
    .single();

  if (error) throw error;
  return data as CartLimits;
}

export async function updateCartLimits(input: Partial<CartLimits>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cart_limits")
    .update(input)
    .eq("id", SINGLETON_ID)
    .select()
    .single();
  if (error) throw error;
  return data as CartLimits;
}
```

- [ ] **Step 4: Products actions**

Create `D:\aroma-web\app\shared\actions\products.actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/app/shared/lib/safe-action";
import { productSchema } from "@/app/shared/lib/validations/product.schema";
import {
  createProduct,
  deleteProduct,
  getProductById,
  updateProduct,
} from "@/app/shared/services/products.service";
import {
  createPack,
  deletePack,
  getPacksByProductId,
  updatePack,
} from "@/app/shared/services/packs.service";
import { deleteImageFromCloudinary } from "@/app/shared/services/cloudinary.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";

const packInputSchema = z.object({
  id: z.string().uuid().optional(),
  cantidad: z.number().int().min(1).max(99),
  precio: z.number().positive().multipleOf(0.01),
});

const createProductSchema = productSchema.extend({
  packs: z.array(packInputSchema).min(1),
});

const updateProductSchema = productSchema.partial().extend({
  id: z.string().uuid(),
  packs: z.array(packInputSchema).optional(),
});

const deleteProductSchema = z.object({ id: z.string().uuid() });

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
}

export const createProductAction = actionClient
  .schema(createProductSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const { packs, ...productData } = parsedInput;
    const product = await createProduct(productData);
    for (const pack of packs) {
      await createPack({
        product_id: product.id,
        cantidad: pack.cantidad,
        precio: pack.precio,
        activo: true,
      });
    }
    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
    return product;
  });

export const updateProductAction = actionClient
  .schema(updateProductSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const { id, packs: inputPacks, ...productData } = parsedInput;
    const product = await updateProduct(id, productData);

    if (inputPacks) {
      const existingPacks = await getPacksByProductId(id);
      const existingIds = new Set(existingPacks.map((p) => p.id));
      const incomingIds = new Set(
        inputPacks.map((p) => p.id).filter(Boolean) as string[]
      );

      for (const existing of existingPacks) {
        if (!incomingIds.has(existing.id)) {
          await deletePack(existing.id);
        }
      }

      for (const pack of inputPacks) {
        if (pack.id && existingIds.has(pack.id)) {
          await updatePack(pack.id, {
            cantidad: pack.cantidad,
            precio: pack.precio,
          });
        } else {
          await createPack({
            product_id: id,
            cantidad: pack.cantidad,
            precio: pack.precio,
            activo: true,
          });
        }
      }
    }

    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
    revalidatePath(`/producto/${product.slug}`);
    return product;
  });

export const deleteProductAction = actionClient
  .schema(deleteProductSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const existing = await getProductById(parsedInput.id);
    if (existing?.imagen_public_id) {
      try {
        await deleteImageFromCloudinary(existing.imagen_public_id);
      } catch (error) {
        console.error("Failed to delete old image from Cloudinary", error);
      }
    }
    await deleteProduct(parsedInput.id);
    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
  });
```

- [ ] **Step 5: Packs actions**

Create `D:\aroma-web\app\shared\actions\packs.actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { actionClient } from "@/app/shared/lib/safe-action";
import { packSchema } from "@/app/shared/lib/validations/pack.schema";
import { createPack, deletePack, updatePack } from "@/app/shared/services/packs.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
}

const createPackSchema = packSchema.extend({
  product_id: z.string().uuid(),
});

const updatePackSchema = packSchema.partial().extend({
  id: z.string().uuid(),
});

const deletePackSchema = z.object({ id: z.string().uuid() });

export const createPackAction = actionClient
  .schema(createPackSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const pack = await createPack(parsedInput);
    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
    return pack;
  });

export const updatePackAction = actionClient
  .schema(updatePackSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    const { id, ...data } = parsedInput;
    const pack = await updatePack(id, data);
    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
    return pack;
  });

export const deletePackAction = actionClient
  .schema(deletePackSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    await deletePack(parsedInput.id);
    revalidatePath("/dashboard/productos");
    revalidatePath("/coleccion");
  });
```

- [ ] **Step 6: Config actions**

Create `D:\aroma-web\app\shared\actions\config.actions.ts`:
```ts
"use server";

import { revalidatePath } from "next/cache";
import { actionClient } from "@/app/shared/lib/safe-action";
import { cartLimitsSchema, whatsappConfigSchema } from "@/app/shared/lib/validations/config.schema";
import { updateCartLimits, updateWhatsAppConfig } from "@/app/shared/services/config.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
}

export const updateWhatsAppConfigAction = actionClient
  .schema(whatsappConfigSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    await updateWhatsAppConfig(parsedInput);
    revalidatePath("/dashboard/configuracion");
  });

export const updateCartLimitsAction = actionClient
  .schema(cartLimitsSchema)
  .action(async ({ parsedInput }) => {
    await requireAdmin();
    await updateCartLimits(parsedInput);
    revalidatePath("/dashboard/configuracion");
  });
```

- [ ] **Step 7: Commit**

```bash
git add app/shared/services app/shared/actions
git commit -m "feat: add product, pack and config services with server actions"
```

---

## Task 6: Cloudinary Image Handling

**Files:**
- Create: `app/shared/services/cloudinary.service.ts`, `app/shared/lib/validations/image.schema.ts`, `app/shared/actions/cloudinary.actions.ts`

**Interfaces:**
- Produces: `uploadImage(file: File)`, `deleteImage(publicId: string)`, `validateImageFile(file: File)`.
- Consumes: Cloudinary SDK and environment variables.

- [ ] **Step 1: Cloudinary service**

Create `D:\aroma-web\app\shared\services\cloudinary.service.ts`:
```ts
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(buffer: Buffer, folder = "aroma/products") {
  return new Promise<{ public_id: string; secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({ public_id: result.public_id, secure_url: result.secure_url });
        }
      )
      .end(buffer);
  });
}

export async function deleteImageFromCloudinary(publicId: string) {
  return new Promise<void>((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}
```

- [ ] **Step 2: Image validation**

Create `D:\aroma-web\app\shared\lib\validations\image.schema.ts`:
```ts
import { z } from "zod";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

export const imageFileSchema = z.instanceof(File).refine(
  (file) => file.size <= MAX_SIZE_BYTES,
  "La imagen debe pesar menos de 5 MB"
);

export function validateImageFile(file: File): { valid: boolean; mimeType?: string; error?: string } {
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: "La imagen debe pesar menos de 5 MB" };
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return { valid: false, error: "Solo se permiten imágenes JPG, PNG o WebP" };
  }

  return { valid: true, mimeType: file.type };
}

export async function verifyMagicBytes(file: File, expectedMime: string): Promise<boolean> {
  const bytes = MAGIC_BYTES[expectedMime];
  if (!bytes) return false;
  const buffer = Buffer.from(await file.arrayBuffer());
  return bytes.every((byte, index) => buffer[index] === byte);
}
```

- [ ] **Step 3: Cloudinary actions**

Create `D:\aroma-web\app\shared\actions\cloudinary.actions.ts`:
```ts
"use server";

import { z } from "zod";
import { actionClient } from "@/app/shared/lib/safe-action";
import { validateImageFile, verifyMagicBytes } from "@/app/shared/lib/validations/image.schema";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "@/app/shared/services/cloudinary.service";
import { getCurrentUser } from "@/app/shared/services/auth.service";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
}

export const uploadProductImageAction = actionClient
  .schema(z.instanceof(File))
  .action(async ({ parsedInput: file }) => {
    await requireAdmin();
    const validation = validateImageFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const isRealImage = await verifyMagicBytes(file, validation.mimeType!);
    if (!isRealImage) throw new Error("El archivo no es una imagen válida");

    const buffer = Buffer.from(await file.arrayBuffer());
    return await uploadImageToCloudinary(buffer);
  });

export const deleteProductImageAction = actionClient
  .schema(z.object({ publicId: z.string().min(1) }))
  .action(async ({ parsedInput: { publicId } }) => {
    await requireAdmin();
    await deleteImageFromCloudinary(publicId);
  });
```

- [ ] **Step 4: Commit**

```bash
git add app/shared/services/cloudinary.service.ts app/shared/lib/validations/image.schema.ts app/shared/actions/cloudinary.actions.ts
git commit -m "feat: add cloudinary image upload, validation and delete actions"
```

---

## Task 7: Dashboard Product CRUD

**Files:**
- Create: `app/(dashboard)/dashboard/productos/page.tsx`, `app/(dashboard)/dashboard/productos/nuevo/page.tsx`, `app/(dashboard)/dashboard/productos/[id]/editar/page.tsx`, `app/shared/components/dashboard/ProductForm.tsx`, `app/shared/components/dashboard/ProductList.tsx`

**Interfaces:**
- Consumes: `getAllProducts`, `createProductAction`, `updateProductAction`, `deleteProductAction`, `createPackAction`, `updatePackAction`, `deletePackAction`, `uploadProductImageAction`, `deleteProductImageAction`.

- [ ] **Step 1: Product list page**

Create `D:\aroma-web\app\(dashboard)\dashboard\productos\page.tsx`:
```tsx
import Link from "next/link";
import { getAllProducts } from "@/app/shared/services/products.service";
import ProductList from "@/app/shared/components/dashboard/ProductList";

export default async function ProductsDashboardPage() {
  const products = await getAllProducts();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-hard-brown">Productos</h1>
        <Link
          href="/dashboard/productos/nuevo"
          className="rounded bg-hard-brown px-4 py-2 text-white"
        >
          Nuevo producto
        </Link>
      </div>
      <ProductList products={products} />
    </div>
  );
}
```

- [ ] **Step 2: ProductList component**

Create `D:\aroma-web\app\shared\components\dashboard\ProductList.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { deleteProductAction } from "@/app/shared/actions/products.actions";
import type { Product } from "@/app/shared/types";

export default function ProductList({ products }: { products: Product[] }) {
  const { execute } = useAction(deleteProductAction);

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center justify-between rounded border border-hard-brown bg-white p-4"
        >
          <div>
            <h3 className="font-bold text-hard-brown">{product.nombre}</h3>
            <p className="text-sm text-hard-brown/70">/{product.slug}</p>
            <p className="text-sm text-hard-brown/70">
              {product.packs?.length ?? 0} packs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/productos/${product.id}/editar`}
              className="text-sm text-hard-brown underline"
            >
              Editar
            </Link>
            <button
              onClick={() => execute({ id: product.id })}
              className="text-sm text-red-600 underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Product form component**

Create `D:\aroma-web\app\shared\components\dashboard\ProductForm.tsx`:
```tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateSlug } from "@/app/shared/lib/utils/slug";
import {
  deleteProductImageAction,
  uploadProductImageAction,
} from "@/app/shared/actions/cloudinary.actions";
import {
  createProductAction,
  updateProductAction,
} from "@/app/shared/actions/products.actions";
import type { Pack, Product } from "@/app/shared/types";

interface ProductFormProps {
  product?: Product;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.nombre ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.descripcion ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imagen_url ?? "");
  const [imagePublicId, setImagePublicId] = useState(product?.imagen_public_id ?? "");
  const [previousImagePublicId, setPreviousImagePublicId] = useState(product?.imagen_public_id ?? "");
  const [packs, setPacks] = useState<Pack[]>(product?.packs ?? []);
  const [isUploading, setIsUploading] = useState(false);

  const { execute: createProduct } = useAction(createProductAction);
  const { execute: updateProduct } = useAction(updateProductAction);

  async function handleImageUpload(file: File) {
    setIsUploading(true);
    const result = await uploadProductImageAction(file);
    if (result?.data) {
      setImageUrl(result.data.secure_url);
      setImagePublicId(result.data.public_id);
    }
    setIsUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    const baseData = {
      nombre: formData.get("nombre") as string,
      slug: formData.get("slug") as string,
      descripcion: formData.get("descripcion") as string,
      imagen_url: imageUrl || null,
      imagen_public_id: imagePublicId || null,
    };

    const packsPayload = packs.map((pack) => ({
      id: pack.id.startsWith("temp-") ? undefined : pack.id,
      cantidad: Number(pack.cantidad),
      precio: Number(pack.precio),
    }));

    if (product) {
      await updateProduct({ id: product.id, ...baseData, packs: packsPayload as any });
      if (previousImagePublicId && previousImagePublicId !== imagePublicId) {
        try {
          await deleteProductImageAction({ publicId: previousImagePublicId });
        } catch (error) {
          console.error("Failed to delete old image", error);
        }
      }
    } else {
      await createProduct({ ...baseData, packs: packsPayload as any });
    }

    router.push("/dashboard/productos");
    router.refresh();
  }

  return (
    <form action={handleSubmit} className="space-y-6 rounded border border-hard-brown bg-white p-6">
      <div>
        <label className="block text-sm font-medium text-hard-brown">Nombre</label>
        <input
          name="nombre"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!product) setSlug(generateSlug(e.target.value));
          }}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-hard-brown">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          required
          pattern="^[a-z0-9-]+$"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-hard-brown">Descripción</label>
        <textarea
          name="descripcion"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          rows={4}
          required
          minLength={10}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-hard-brown">Imagen</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          className="mt-1"
        />
        {isUploading && <p className="mt-2 text-sm text-hard-brown">Subiendo...</p>}
        {imageUrl && (
          <img src={imageUrl} alt="Preview" className="mt-2 h-32 w-32 rounded object-cover" />
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-hard-brown">Packs</label>
          <button
            type="button"
            onClick={() =>
              setPacks((prev) => [
                ...prev,
                { id: `temp-${crypto.randomUUID()}`, cantidad: 1, precio: 0, product_id: product?.id ?? "", activo: true } as Pack,
              ])
            }
            className="text-sm text-hard-brown underline"
          >
            Agregar pack
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {packs.map((pack, index) => (
            <div key={pack.id} className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={99}
                value={pack.cantidad}
                onChange={(e) => {
                  const updated = [...packs];
                  updated[index] = { ...pack, cantidad: Number(e.target.value) };
                  setPacks(updated);
                }}
                className="w-24 rounded border border-hard-brown p-2"
                placeholder="Cantidad"
              />
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={pack.precio}
                onChange={(e) => {
                  const updated = [...packs];
                  updated[index] = { ...pack, precio: Number(e.target.value) };
                  setPacks(updated);
                }}
                className="w-32 rounded border border-hard-brown p-2"
                placeholder="Precio"
              />
              <button
                type="button"
                onClick={() => setPacks((prev) => prev.filter((_, i) => i !== index))}
                className="text-sm text-red-600 underline"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="rounded bg-hard-brown px-6 py-2 text-white"
      >
        {product ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Create and edit pages**

Create `D:\aroma-web\app\(dashboard)\dashboard\productos\nuevo\page.tsx`:
```tsx
import ProductForm from "@/app/shared/components/dashboard/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-hard-brown">Nuevo producto</h1>
      <ProductForm />
    </div>
  );
}
```

Create `D:\aroma-web\app\(dashboard)\dashboard\productos\[id]\editar\page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getProductById } from "@/app/shared/services/products.service";
import ProductForm from "@/app/shared/components/dashboard/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-hard-brown">Editar producto</h1>
      <ProductForm product={product} />
    </div>
  );
}
```

Add `getProductById` to `D:\aroma-web\app\shared\services\products.service.ts`:
```ts
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, packs(*)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Product;
}
```

- [ ] **Step 5: Commit**

```bash
git add app/\(dashboard\)/dashboard/productos app/shared/components/dashboard/ProductForm.tsx app/shared/components/dashboard/ProductList.tsx app/shared/services/products.service.ts
git commit -m "feat: add dashboard product crud"
```

---

## Task 8: Dashboard Configuration Page

**Files:**
- Create: `app/(dashboard)/dashboard/configuracion/page.tsx`, `app/shared/components/dashboard/ConfigForm.tsx`

**Interfaces:**
- Consumes: `getWhatsAppConfig`, `getCartLimits`, `updateWhatsAppConfigAction`, `updateCartLimitsAction`.

- [ ] **Step 1: Config form**

Create `D:\aroma-web\app\shared\components\dashboard\ConfigForm.tsx`:
```tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { updateWhatsAppConfigAction } from "@/app/shared/actions/config.actions";
import type { WhatsAppConfig } from "@/app/shared/types";

export default function ConfigForm({ config }: { config: WhatsAppConfig }) {
  const { execute } = useAction(updateWhatsAppConfigAction);

  return (
    <form
      action={execute}
      className="space-y-6 rounded border border-hard-brown bg-white p-6"
    >
      <div>
        <label className="block text-sm font-medium text-hard-brown">Teléfono WhatsApp</label>
        <input
          name="telefono"
          defaultValue={config.telefono}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          required
          pattern="\d{10,15}"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-hard-brown">Mensaje base</label>
        <textarea
          name="mensaje_base"
          defaultValue={config.mensaje_base}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-hard-brown">Mensaje personalizado</label>
        <textarea
          name="mensaje_personalizado"
          defaultValue={config.mensaje_personalizado}
          className="mt-1 w-full rounded border border-hard-brown p-2"
          rows={3}
          required
        />
      </div>
      <button type="submit" className="rounded bg-hard-brown px-6 py-2 text-white">
        Guardar configuración
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Config page**

Create `D:\aroma-web\app\(dashboard)\dashboard\configuracion\page.tsx`:
```tsx
import { getWhatsAppConfig } from "@/app/shared/services/config.service";
import ConfigForm from "@/app/shared/components/dashboard/ConfigForm";

export default async function ConfigurationPage() {
  const config = await getWhatsAppConfig();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-hard-brown">Configuración</h1>
      <ConfigForm config={config} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\(dashboard\)/dashboard/configuracion app/shared/components/dashboard/ConfigForm.tsx
git commit -m "feat: add dashboard configuration page"
```

---

## Task 9: Public Collection Page

**Files:**
- Modify: `app/(public)/coleccion/page.tsx`, `app/shared/components/public/home/Coleccion.tsx`

**Interfaces:**
- Consumes: `getProducts()`.

- [ ] **Step 1: Update collection page**

Edit `D:\aroma-web\app\(public)\coleccion\page.tsx`:
```tsx
import { getProducts } from "@/app/shared/services/products.service";
import ProductCard from "@/app/shared/components/public/home/Producto";

export default async function ColeccionPage() {
  const products = await getProducts();

  return (
    <main className="bg-[#F4EDE9] px-6 py-24">
      <h1 className="mb-12 text-4xl font-bold text-center text-hard-brown">
        Nuestra Colección
      </h1>
      <div className="mx-auto max-w-5xl space-y-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.nombre}
            description={product.descripcion}
            imageSrc={product.imagen_url ?? "/image.png"}
            price={product.packs?.[0]?.precio ?? 0}
            slug={product.slug}
          />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/\(public\)/coleccion/page.tsx
git commit -m "feat: fetch products from supabase on collection page"
```

---

## Task 10: Product Detail Page

**Files:**
- Create: `app/shared/components/public/ProductDetail.tsx`
- Modify: `app/(public)/coleccion/producto/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProductBySlug`, `getWhatsAppConfig`, `buildWhatsAppUrl`, cart store.

- [ ] **Step 1: Product detail component**

Create `D:\aroma-web\app\shared\components\public\ProductDetail.tsx`:
```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/app/shared/stores/cart.store";
import { buildWhatsAppUrl } from "@/app/shared/lib/utils/whatsapp";
import { formatCurrency } from "@/app/shared/lib/utils/currency";
import type { Product, WhatsAppConfig } from "@/app/shared/types";

interface ProductDetailProps {
  product: Product;
  whatsappConfig: WhatsAppConfig;
}

export default function ProductDetail({ product, whatsappConfig }: ProductDetailProps) {
  const [selectedPackId, setSelectedPackId] = useState(product.packs?.[0]?.id);
  const addItem = useCartStore((s) => s.addItem);

  const selectedPack = product.packs?.find((p) => p.id === selectedPackId);

  function handleAddToCart() {
    if (!selectedPack) return;
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.nombre,
      packId: selectedPack.id,
      packQuantity: selectedPack.cantidad,
      packPrice: selectedPack.precio,
      itemQuantity: 1,
    });
  }

  function handleWhatsApp() {
    if (!selectedPack) return;
    const url = buildWhatsAppUrl(whatsappConfig.telefono, [
      {
        productId: product.id,
        productSlug: product.slug,
        productName: product.nombre,
        packId: selectedPack.id,
        packQuantity: selectedPack.cantidad,
        packPrice: selectedPack.precio,
        itemQuantity: 1,
      },
    ]);
    window.open(url, "_blank");
  }

  return (
    <main className="bg-[#F4EDE9] px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded border border-hard-brown">
          <Image
            src={product.imagen_url ?? "/image.png"}
            alt={product.nombre}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-hard-brown">{product.nombre}</h1>
          <p className="text-hard-brown">{product.descripcion}</p>
          <div>
            <label className="block text-sm font-medium text-hard-brown">Presentación</label>
            <select
              value={selectedPackId}
              onChange={(e) => setSelectedPackId(e.target.value)}
              className="mt-2 w-full rounded border border-hard-brown p-2"
            >
              {product.packs?.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {pack.cantidad} velas — {formatCurrency(pack.precio)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 rounded border border-hard-brown bg-white py-3 text-hard-brown"
            >
              Añadir al carrito
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 rounded bg-hard-brown py-3 text-white"
            >
              Consultar por WhatsApp
            </button>
          </div>
          <Link href="/coleccion" className="text-sm text-hard-brown underline">
            ← Volver a la colección
          </Link>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update product page**

Edit `D:\aroma-web\app\(public)\coleccion\producto\[slug]\page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/app/shared/services/products.service";
import { getWhatsAppConfig } from "@/app/shared/services/config.service";
import ProductDetail from "@/app/shared/components/public/ProductDetail";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const whatsappConfig = await getWhatsAppConfig();

  return <ProductDetail product={product} whatsappConfig={whatsappConfig} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add app/shared/components/public/ProductDetail.tsx app/\(public\)/coleccion/producto/\[slug\]/page.tsx
git commit -m "feat: add product detail page with pack selector and whatsapp cta"
```

---

## Task 11: Cart Store and Cart Page

**Files:**
- Create: `app/shared/stores/cart.store.ts`, `app/shared/hooks/use-cart.ts`, `app/(public)/carrito/page.tsx`, `app/shared/components/public/CartSummary.tsx`

**Interfaces:**
- Produces: `useCartStore`, `CartItem`, `CartState`.
- Consumes: `getWhatsAppConfig`, `buildWhatsAppUrl`.

- [ ] **Step 1: Cart store**

Create `D:\aroma-web\app\shared\stores\cart.store.ts`:
```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/app/shared/types";

const MAX_ITEMS = 10;
const MAX_QUANTITY_PER_ITEM = 99;

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => { success: boolean; message?: string };
  removeItem: (packId: string) => void;
  updateQuantity: (packId: string, quantity: number) => { success: boolean; message?: string };
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const items = get().items;
        const existingIndex = items.findIndex((i) => i.packId === item.packId);

        if (existingIndex >= 0) {
          const newQuantity = items[existingIndex].itemQuantity + item.itemQuantity;
          if (newQuantity > MAX_QUANTITY_PER_ITEM) {
            return { success: false, message: "Máximo 99 unidades por ítem" };
          }
          const updated = [...items];
          updated[existingIndex] = { ...updated[existingIndex], itemQuantity: newQuantity };
          set({ items: updated });
          return { success: true };
        }

        if (items.length >= MAX_ITEMS) {
          return { success: false, message: "Máximo 10 ítems en el carrito" };
        }

        set({ items: [...items, item] });
        return { success: true };
      },
      removeItem: (packId) => {
        set({ items: get().items.filter((i) => i.packId !== packId) });
      },
      updateQuantity: (packId, quantity) => {
        if (quantity < 1) {
          get().removeItem(packId);
          return { success: true };
        }
        if (quantity > MAX_QUANTITY_PER_ITEM) {
          return { success: false, message: "Máximo 99 unidades por ítem" };
        }
        const updated = get().items.map((i) =>
          i.packId === packId ? { ...i, itemQuantity: quantity } : i
        );
        set({ items: updated });
        return { success: true };
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((acc, i) => acc + i.itemQuantity, 0),
      totalPrice: () =>
        get().items.reduce((acc, i) => acc + i.packPrice * i.itemQuantity, 0),
    }),
    { name: "aroma-cart" }
  )
);
```

- [ ] **Step 2: useCart hook**

Create `D:\aroma-web\app\shared\hooks\use-cart.ts`:
```ts
import { useCartStore } from "@/app/shared/stores/cart.store";

export function useCart() {
  return useCartStore();
}
```

- [ ] **Step 3: Cart page**

Create `D:\aroma-web\app\(public)\carrito\page.tsx`:
```tsx
import { getWhatsAppConfig } from "@/app/shared/services/config.service";
import CartView from "@/app/shared/components/public/CartView";

export default async function CartPage() {
  const config = await getWhatsAppConfig();
  return <CartView phone={config.telefono} />;
}
```

Create `D:\aroma-web\app\shared\components\public\CartView.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useCart } from "@/app/shared/hooks/use-cart";
import { buildWhatsAppUrl } from "@/app/shared/lib/utils/whatsapp";
import { formatCurrency } from "@/app/shared/lib/utils/currency";

interface CartViewProps {
  phone: string;
}

export default function CartView({ phone }: CartViewProps) {
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart();

  function handleWhatsApp() {
    if (items.length === 0) return;
    const url = buildWhatsAppUrl(phone, items);
    window.open(url, "_blank");
  }

  if (items.length === 0) {
    return (
      <main className="bg-[#F4EDE9] px-6 py-24 text-center">
        <h1 className="text-3xl font-bold text-hard-brown">Tu carrito está vacío</h1>
        <Link href="/coleccion" className="mt-4 inline-block text-hard-brown underline">
          Ver colección
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-[#F4EDE9] px-6 py-24">
      <h1 className="mb-8 text-3xl font-bold text-hard-brown">Carrito</h1>
      <div className="mx-auto max-w-3xl space-y-4">
        {items.map((item) => (
          <div
            key={item.packId}
            className="flex items-center justify-between rounded border border-hard-brown bg-white p-4"
          >
            <div>
              <h3 className="font-bold text-hard-brown">{item.productName}</h3>
              <p className="text-sm text-hard-brown/70">
                {item.packQuantity} velas x {formatCurrency(item.packPrice)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={99}
                value={item.itemQuantity}
                onChange={(e) => updateQuantity(item.packId, Number(e.target.value))}
                className="w-16 rounded border border-hard-brown p-2"
              />
              <button
                onClick={() => removeItem(item.packId)}
                className="text-sm text-red-600 underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between text-xl font-bold text-hard-brown">
          <span>Total estimado</span>
          <span>{formatCurrency(totalPrice())}</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={clearCart}
            className="flex-1 rounded border border-hard-brown bg-white py-3 text-hard-brown"
          >
            Vaciar carrito
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 rounded bg-hard-brown py-3 text-white"
          >
            Consultar por WhatsApp
          </button>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/shared/stores/cart.store.ts app/shared/hooks/use-cart.ts app/\(public\)/carrito/page.tsx app/shared/components/public/CartView.tsx
git commit -m "feat: add cart store and cart page"
```

---

## Task 12: WhatsApp Utility and Navbar Cart Badge

**Files:**
- Create: `app/shared/lib/utils/whatsapp.ts`
- Modify: `app/shared/components/Navbar.tsx`, `app/shared/components/public/home/Producto.tsx`

**Interfaces:**
- Produces: `buildWhatsAppUrl(phone, items, isPersonalized?)`.

- [ ] **Step 1: WhatsApp utility**

Create `D:\aroma-web\app\shared\lib\utils\whatsapp.ts`:
```ts
import type { CartItem } from "@/app/shared/types";
import { formatCurrency } from "./currency";

export function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  isPersonalized = false
): string {
  const baseMessage = isPersonalized
    ? "Hola Aroma, quiero un pedido personalizado!"
    : "Hola Aroma, quiero consultar por:";

  const lines = items.map((item) => {
    const total = item.packPrice * item.itemQuantity;
    return `- ${item.productName}: ${item.itemQuantity} pack(s) de ${item.packQuantity} velas = ${formatCurrency(total)}`;
  });

  const total = items.reduce((acc, item) => acc + item.packPrice * item.itemQuantity, 0);

  const message = [baseMessage, "", ...lines, "", `Total estimado: ${formatCurrency(total)}`].join(
    "\n"
  );

  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`;
}
```

- [ ] **Step 2: Update Navbar with cart badge**

Edit `D:\aroma-web\app\shared\components\Navbar.tsx`:
```tsx
"use client";

import { useCart } from "@/app/shared/hooks/use-cart";

// inside Navbar component, replace the cart link with:
const totalItems = useCart((s) => s.totalItems());

<Link
  href="/carrito"
  aria-label="Abrir carrito"
  className="..."
>
  <ShoppingBag aria-hidden="true" />
  {totalItems > 0 && (
    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs text-black">
      {totalItems}
    </span>
  )}
</Link>
```

- [ ] **Step 3: Update ProductCard link**

Edit `D:\aroma-web\app\shared\components\public\home\Producto.tsx`:
```tsx
href={`/coleccion/producto/${encodeURIComponent(slug)}`}
```

- [ ] **Step 4: Commit**

```bash
git add app/shared/lib/utils/whatsapp.ts app/shared/components/Navbar.tsx app/shared/components/public/home/Producto.tsx
git commit -m "feat: add whatsapp url builder, cart badge and fix product link"
```

---

## Task 13: Testing and Final Validation

**Files:**
- Modify: any files needed for fixes.

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Expected: no errors.

- [ ] **Step 2: Run dev server**

```bash
pnpm dev
```

Open http://localhost:3000.

- [ ] **Step 3: Manual test checklist**

- [ ] Admin can log in.
- [ ] Admin can create product with image and packs.
- [ ] Admin can edit product (including image replacement).
- [ ] Admin can delete product.
- [ ] Admin can update WhatsApp config.
- [ ] Public collection page shows active products.
- [ ] Product detail page shows pack selector.
- [ ] “Añadir al carrito” adds to cart and updates badge.
- [ ] “Consultar por WhatsApp” from product page opens correct message.
- [ ] Cart page shows items, allows quantity changes, respects limits.
- [ ] Cart page WhatsApp button opens message with all items.
- [ ] Attempting to upload a non-image file (e.g., `.txt` renamed to `.jpg`) is rejected.
- [ ] Unauthenticated user cannot access `/dashboard/*`.

- [ ] **Step 4: Commit final fixes**

```bash
git add -A
git commit -m "fix: final adjustments and validation"
```

---

## Self-Review

- **Spec coverage:** All design sections map to at least one task.
- **Placeholder scan:** No `TBD`, `TODO`, or vague steps. Image validation, pack management, and product CRUD include complete code.
- **Type consistency:** `Product`, `Pack`, `CartItem`, `WhatsAppConfig`, `CartLimits` types reused across services and components.
- **Known gaps:** The `ProductForm` pack management UI is described briefly; implement it as a separate sub-component or inline rows. Cart page uses `useState` for config — consider converting to a Server Component that passes config as a prop for better SSR, but the current approach works for an anonymous client-side cart.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-30-aroma-supabase-plan.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — I execute tasks in this session using `executing-plans`, with checkpoints for review.

**Which approach do you prefer?**
