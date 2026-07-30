# Aroma Web — Technical Design
## Supabase + Cloudinary + Cart + WhatsApp Integration

**Date:** 2026-07-30  
**Status:** Approved

---

## 1. Objective

Connect the Aroma frontend (Next.js 16 App Router) to a Supabase backend to enable:

- CRUD management of products (candles) and configurable packs from an admin dashboard.
- Anonymous shopping cart with item and quantity limits.
- Dynamic WhatsApp message generation from the product page and the cart.
- Centralized configuration of WhatsApp phone number and message templates from the dashboard.
- Secure image handling via Cloudinary.

---

## 2. Stack and Libraries

| Library | Purpose | Official Docs |
|---|---|---|
| `@supabase/supabase-js` | Browser Supabase client | https://supabase.com/docs/reference/javascript |
| `@supabase/ssr` | Server-side Supabase client (Server Components, Server Actions, Middleware) | https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs |
| `next-safe-action` | Type-safe Server Actions with Zod validation | https://next-safe-action.dev/docs/getting-started |
| `zod` | Schema validation | https://zod.dev |
| `zustand` + `persist` | Client-side cart state with `localStorage` persistence | https://zustand.docs.pmnd.rs/getting-started/introduction |
| `sonner` | Toast notifications | https://sonner.emilkowal.dev |
| `cloudinary` | Server-side Cloudinary SDK for image upload/delete | https://cloudinary.com/documentation/node_integration |

The **Supabase Agent Skill** installed in the workspace should be used when creating tables, RLS policies, and verifying the database schema.

---

## 3. Folder Structure

```
app/
├── (public)/                    # Public routes (no auth)
│   ├── layout.tsx               # Navbar + Footer
│   ├── home/page.tsx
│   ├── coleccion/page.tsx
│   ├── coleccion/producto/[slug]/page.tsx
│   ├── carrito/page.tsx
│   └── personalizacion/page.tsx
│
├── (dashboard)/                 # Protected admin routes
│   ├── layout.tsx               # Session verification
│   ├── dashboard/page.tsx
│   ├── dashboard/productos/page.tsx
│   ├── dashboard/productos/nuevo/page.tsx
│   ├── dashboard/productos/[id]/editar/page.tsx
│   └── dashboard/configuracion/page.tsx
│
├── login/page.tsx
├── layout.tsx
├── page.tsx                     # redirect to /home
│
└── shared/
    ├── components/
    │   ├── public/              # Store components
    │   ├── dashboard/           # Admin components
    │   └── ui/                  # Reusable primitives
    ├── services/
    │   ├── products.service.ts
    │   ├── packs.service.ts
    │   ├── config.service.ts
    │   ├── cloudinary.service.ts
    │   └── auth.service.ts
    ├── actions/
    │   ├── products.actions.ts
    │   ├── packs.actions.ts
    │   ├── config.actions.ts
    │   └── cloudinary.actions.ts
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts
    │   │   ├── server.ts
    │   │   └── middleware.ts
    │   ├── validations/
    │   │   ├── product.schema.ts
    │   │   ├── pack.schema.ts
    │   │   └── config.schema.ts
    │   ├── utils/
    │   │   ├── whatsapp.ts
    │   │   ├── currency.ts
    │   │   └── slug.ts
    │   └── safe-action.ts
    ├── stores/
    │   └── cart.store.ts
    ├── hooks/
    │   └── use-cart.ts
    └── types/
        └── index.ts
```

---

## 4. Data Model (Supabase)

### 4.1 `products`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` |
| `slug` | `text` | Unique, URL-friendly |
| `nombre` | `text` | Product name |
| `descripcion` | `text` | Product description |
| `imagen_public_id` | `text` | Cloudinary public_id |
| `imagen_url` | `text` | Cloudinary secure URL |
| `activo` | `boolean` | Soft-delete / hide flag |
| `created_at` | `timestamptz` | Auto |
| `updated_at` | `timestamptz` | Auto |

### 4.2 `packs`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK |
| `product_id` | `uuid` | FK → `products(id)` on delete cascade |
| `cantidad` | `smallint` | Candles per pack, 1-99 |
| `precio` | `numeric(10,2)` | Pack price |
| `activo` | `boolean` | |

### 4.3 `whatsapp_config`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK fixed singleton value |
| `telefono` | `text` | E.164 without `+`, e.g. `51945513054` |
| `mensaje_base` | `text` | Default order message prefix |
| `mensaje_personalizado` | `text` | Personalized order message |

### 4.4 `cart_limits`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | PK fixed singleton value |
| `max_items` | `smallint` | Max distinct cart items (default 10) |
| `max_quantity_per_item` | `smallint` | Max quantity per item (default 99) |

### 4.5 Row Level Security (RLS)

- `products`, `packs`: `SELECT` public, writes only authenticated users.
- `whatsapp_config`, `cart_limits`: `SELECT` public, writes only authenticated users.

---

## 5. Cloudinary Image Handling

### 5.1 Upload

- Images are uploaded only through Server Actions.
- Validation before upload:
  1. Real MIME type (`image/jpeg`, `image/png`, `image/webp`).
  2. Magic bytes verification.
  3. File size max 5 MB.
  4. Minimum recommended dimensions.
- Server Action returns `public_id` and `secure_url`.

### 5.2 Replace / Delete

- On product edit with new image:
  1. Upload new image to Cloudinary.
  2. Update `imagen_public_id` and `imagen_url` in the database.
  3. Delete old image from Cloudinary using previous `public_id`.
  4. If deletion fails, log error but do not roll back the update.

### 5.3 Security

- Cloudinary API secret is never exposed to the client.
- Upload signature or server SDK is used exclusively in Server Actions.

---

## 6. Authentication

- Supabase Auth with email/password.
- Only admin accounts exist; no public registration.
- First admin created via Supabase dashboard or seed script.
- Middleware refreshes the session.
- Dashboard layout verifies session with `getUser()` and redirects to `/login` if missing.

---

## 7. Cart

### 7.1 Cart Item

```ts
interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  packId: string;
  packQuantity: number;   // candles per pack
  packPrice: number;      // price of one pack
  itemQuantity: number;   // how many packs
}
```

### 7.2 Limits

- Max 10 distinct items.
- Max 99 units per item.
- Duplicate item (same pack) merges quantities respecting limits.

### 7.3 Persistence

- Zustand store with `persist` middleware saves to `localStorage`.
- Store validates limits and returns success/error feedback.

---

## 8. WhatsApp Message Generation

### 8.1 Configuration

- Phone and message templates come from `whatsapp_config`.
- Configurable from `/dashboard/configuracion`.

### 8.2 Generator Function

```ts
export function buildWhatsAppUrl(
  phone: string,
  items: CartItem[],
  isPersonalized?: boolean
): string
```

### 8.3 User Flows

1. **Product page** shows two CTAs:
   - **Añadir al carrito**
   - **Consultar por WhatsApp** (opens WhatsApp with the selected pack only)
2. **Cart page** shows:
   - List of items
   - Quantity adjustment
   - Remove button
   - **Consultar por WhatsApp** with all items

---

## 9. Server Actions (next-safe-action)

- `products.actions.ts`: `createProduct`, `updateProduct`, `deleteProduct`, `toggleProductStatus`
- `packs.actions.ts`: `createPack`, `updatePack`, `deletePack`
- `config.actions.ts`: `updateWhatsAppConfig`, `updateCartLimits`
- `cloudinary.actions.ts`: `uploadProductImage`, `deleteProductImage`

All actions verify admin session before executing and call `revalidatePath` for affected public pages.

---

## 10. Validation Rules (Zod)

| Field | Rule |
|---|---|
| `slug` | `^[a-z0-9-]+$`, unique, max 120 |
| `nombre` | min 2, max 120 |
| `descripcion` | min 10 |
| `precio` | positive, max 2 decimals |
| `cantidad` | integer 1-99 |
| `telefono` | digits only, 10-15 chars |
| image file | real MIME + magic bytes, < 5 MB |

---

## 11. Error Handling

- Public pages: use `error.tsx` and `loading.tsx`.
- Dashboard forms: show Zod validation errors per field and server errors in toast.
- Cart: enforce limits in the store and surface messages in UI.
- Cloudinary delete failures are logged but do not block product updates.
- Supabase outage: friendly user-facing message.

---

## 12. Implementation Order

1. Supabase project setup and environment variables.
2. Create tables and RLS policies.
3. Install dependencies.
4. Configure Supabase SSR clients (server, client, middleware).
5. Implement admin auth and dashboard layout.
6. Implement product/pack services and Server Actions.
7. Build dashboard product CRUD.
8. Integrate Cloudinary upload/replace/delete.
9. Refactor public pages to use real data.
10. Build product detail page with pack selector and WhatsApp CTA.
11. Implement cart store.
12. Build `/carrito` page.
13. Implement WhatsApp message generator.
14. Build `/dashboard/configuracion` page.
15. Manual testing and validation.
