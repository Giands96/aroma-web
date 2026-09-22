-- RLS hardening para aroma-web.
--
-- APLICAR con: supabase db push  (proyecto linkeado) o pegando en el
-- SQL editor del dashboard de Supabase.
--
-- IMPORTANTE: en Postgres las policies permisivas son ADITIVAS (con que
-- UNA permita, alcanza). Antes de aplicar, auditar y borrar las
-- permisivas existentes:
--
--   select schemaname, tablename, policyname, roles, cmd, qual, with_check
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, policyname;
--
-- Borrar toda policy tipo "Enable all / Allow all" sobre estas tablas.
-- Recién después aplicar este archivo.
--
-- Modelo de acceso (sale del código en app/shared/services/*):
-- - anon: solo SELECT de productos/opciones activos, destacados,
--   whatsapp_config (clave='principal') y cart_limits.
-- - authenticated no-admin: además puede leer su propia fila de
--   admin_users (para el check). NADA más.
-- - authenticated admin (fila en admin_users): lectura total + escritura.
-- - service_role: bypasea RLS (solo uso server-side, nunca en cliente).

-- ------------------------------------------------------------------
-- Helper: ¿el JWT actual es admin? SECURITY DEFINER para leer
-- admin_users sin recursión de policies. Solo revela el estado del
-- propio caller. EXECUTE solo para authenticated (ver GRANTs abajo).
-- ------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------------
-- admin_users
-- ------------------------------------------------------------------
alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
  on public.admin_users for select
  to authenticated
  using (user_id = (select auth.uid()));

grant select on public.admin_users to authenticated;

-- ------------------------------------------------------------------
-- products
-- ------------------------------------------------------------------
alter table public.products enable row level security;

drop policy if exists "products_select_public" on public.products;
create policy "products_select_public"
  on public.products for select
  to anon, authenticated
  using (activo = true);

drop policy if exists "products_select_admin" on public.products;
create policy "products_select_admin"
  on public.products for select
  to authenticated
  using (public.is_admin());

drop policy if exists "products_insert_admin" on public.products;
create policy "products_insert_admin"
  on public.products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "products_update_admin" on public.products;
create policy "products_update_admin"
  on public.products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "products_delete_admin" on public.products;
create policy "products_delete_admin"
  on public.products for delete
  to authenticated
  using (public.is_admin());

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- ------------------------------------------------------------------
-- product_options
-- ------------------------------------------------------------------
alter table public.product_options enable row level security;

drop policy if exists "product_options_select_public" on public.product_options;
create policy "product_options_select_public"
  on public.product_options for select
  to anon, authenticated
  using (activo = true);

drop policy if exists "product_options_select_admin" on public.product_options;
create policy "product_options_select_admin"
  on public.product_options for select
  to authenticated
  using (public.is_admin());

drop policy if exists "product_options_insert_admin" on public.product_options;
create policy "product_options_insert_admin"
  on public.product_options for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "product_options_update_admin" on public.product_options;
create policy "product_options_update_admin"
  on public.product_options for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "product_options_delete_admin" on public.product_options;
create policy "product_options_delete_admin"
  on public.product_options for delete
  to authenticated
  using (public.is_admin());

grant select on public.product_options to anon, authenticated;
grant insert, update, delete on public.product_options to authenticated;

-- ------------------------------------------------------------------
-- featured_products (filas públicas: id, product_id, posicion)
-- ------------------------------------------------------------------
alter table public.featured_products enable row level security;

drop policy if exists "featured_products_select_public" on public.featured_products;
create policy "featured_products_select_public"
  on public.featured_products for select
  to anon, authenticated
  using (true);

drop policy if exists "featured_products_insert_admin" on public.featured_products;
create policy "featured_products_insert_admin"
  on public.featured_products for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "featured_products_update_admin" on public.featured_products;
create policy "featured_products_update_admin"
  on public.featured_products for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "featured_products_delete_admin" on public.featured_products;
create policy "featured_products_delete_admin"
  on public.featured_products for delete
  to authenticated
  using (public.is_admin());

grant select on public.featured_products to anon, authenticated;
grant insert, update, delete on public.featured_products to authenticated;

-- ------------------------------------------------------------------
-- whatsapp_config (singleton clave='principal'; sin columnas sensibles)
-- ------------------------------------------------------------------
alter table public.whatsapp_config enable row level security;

drop policy if exists "whatsapp_config_select_public" on public.whatsapp_config;
create policy "whatsapp_config_select_public"
  on public.whatsapp_config for select
  to anon, authenticated
  using (clave = 'principal');

drop policy if exists "whatsapp_config_insert_admin" on public.whatsapp_config;
create policy "whatsapp_config_insert_admin"
  on public.whatsapp_config for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "whatsapp_config_update_admin" on public.whatsapp_config;
create policy "whatsapp_config_update_admin"
  on public.whatsapp_config for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.whatsapp_config to anon, authenticated;
grant insert, update on public.whatsapp_config to authenticated;

-- ------------------------------------------------------------------
-- cart_limits (límites no sensibles, lectura pública)
-- ------------------------------------------------------------------
alter table public.cart_limits enable row level security;

drop policy if exists "cart_limits_select_public" on public.cart_limits;
create policy "cart_limits_select_public"
  on public.cart_limits for select
  to anon, authenticated
  using (true);

drop policy if exists "cart_limits_update_admin" on public.cart_limits;
create policy "cart_limits_update_admin"
  on public.cart_limits for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on public.cart_limits to anon, authenticated;
grant update on public.cart_limits to authenticated;
