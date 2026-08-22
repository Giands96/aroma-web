import "server-only";
import { createClient, createPublicClient } from "@/app/shared/lib/supabase/server";
import {
  MAX_FEATURED_PRODUCTS,
  MIN_FEATURED_PRODUCTS,
} from "@/app/shared/lib/featured-products";
import type { ProductOptionInput } from "@/app/shared/lib/validations/product-option.schema";
import type { ProductImage } from "@/app/shared/lib/validations/product-image.schema";
import type { Product } from "@/app/shared/types/product.types";
import type { FeaturedProduct } from "@/app/shared/types";
import { unstable_cache } from "next/cache";

export const PUBLIC_PRODUCTS_CACHE_TAG = "public-products";

export interface ProductWriteInput {
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_public_id?: string | null;
  imagen_url?: string | null;
  imagenes?: ProductImage[];
  activo?: boolean;
}

export type ProductOptionWriteInput = ProductOptionInput & { id?: string };

export interface PaginatedProducts {
  products: Product[];
  total: number;
}

// Método para obtener una página de productos con paginación
export async function getProductsPage(
  page: number,
  pageSize: number
): Promise<PaginatedProducts> {
  const supabase = await createClient();
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const { data, error, count } = await supabase
    .from("products")
    .select("*, product_options!inner(*)", { count: "exact" })
    .eq("activo", true)
    .eq("product_options.activo", true)
    .order("cantidad", { ascending: true, referencedTable: "product_options" })
    .order("created_at", { ascending: false })
    .range(start, end);

  if (error) throw error;
  return { products: (data ?? []) as Product[], total: count ?? 0 };
}

const getCachedPublicProductsPage = unstable_cache(
  async (
    page: number,
    pageSize: number,
  ): Promise<PaginatedProducts> => {
    const supabase = createPublicClient();
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    const { data, error, count } = await supabase
      .from("products")
      .select("*, product_options!inner(*)", { count: "exact" })
      .eq("activo", true)
      .eq("product_options.activo", true)
      .order("cantidad", { ascending: true, referencedTable: "product_options" })
      .order("created_at", { ascending: false })
      .range(start, end);

    if (error) throw error;

    return { products: (data ?? []) as Product[], total: count ?? 0 };
  },
  ["public-products-page"],
  {
    revalidate: 300,
    tags: [PUBLIC_PRODUCTS_CACHE_TAG],
  },
);

export function getPublicProductsPage(
  page: number,
  pageSize: number,
): Promise<PaginatedProducts> {
  return getCachedPublicProductsPage(page, pageSize);
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_options!inner(*)")
    .eq("activo", true)
    .eq("product_options.activo", true)
    .order("cantidad", { ascending: true, referencedTable: "product_options" })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getThreeLastProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_options!inner(*)")
    .eq("activo", true)
    .eq("product_options.activo", true)
    .order("created_at", { ascending: false })
    .order("cantidad", { ascending: true, referencedTable: "product_options" })
    .limit(3);

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_options!inner(*)")
    .eq("slug", slug)
    .eq("activo", true)
    .eq("product_options.activo", true)
    .order("cantidad", { ascending: true, referencedTable: "product_options" })
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Product;
}

const getCachedPublicProductBySlug = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, product_options!inner(*)")
      .eq("slug", slug)
      .eq("activo", true)
      .eq("product_options.activo", true)
      .order("cantidad", { ascending: true, referencedTable: "product_options" })
      .single();

    if (error?.code === "PGRST116") return null;
    if (error) throw error;

    return data as Product;
  },
  ["public-product-detail"],
  {
    revalidate: 300,
    tags: [PUBLIC_PRODUCTS_CACHE_TAG],
  },
);

export function getPublicProductBySlug(slug: string): Promise<Product | null> {
  return getCachedPublicProductBySlug(slug);
}


export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_options(*)")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Product;
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_options(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function createProduct(input: ProductWriteInput): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function setProductImages(
  id: string,
  images: ProductImage[]
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      imagenes: images,
      imagen_public_id: images[0]?.public_id ?? null,
      imagen_url: images[0]?.secure_url ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function createProductWithOptions(
  productInput: ProductWriteInput,
  options: ProductOptionWriteInput[]
): Promise<Product> {
  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .insert(productInput)
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  const optionRows = options.map((option) => {
    const row = { ...option, product_id: product.id };
    if (row.id === undefined) delete row.id;
    return row;
  });
  const { data: productOptions, error: optionsError } = await supabase
    .from("product_options")
    .insert(optionRows)
    .select();

  if (optionsError) {
    await supabase.from("products").delete().eq("id", product.id);
    throw new Error(optionsError.message);
  }

  return { ...product, product_options: productOptions ?? [] } as Product;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductWriteInput>
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Product;
}

export async function clearProductImage(
  id: string,
  expectedPublicId: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ imagen_public_id: null, imagen_url: null })
    .eq("id", id)
    .eq("imagen_public_id", expectedPublicId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as Product | null;
}

export async function updateProductWithOptions(
  id: string,
  productInput: Partial<ProductWriteInput>,
  options: ProductOptionWriteInput[]
): Promise<Product> {
  const optionIds = options?.flatMap((option) => (option.id ? [option.id.toLowerCase()] : [])) ?? [];
  if (new Set(optionIds).size !== optionIds.length) {
    throw new Error("Duplicate product option IDs are not allowed");
  }

  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .update(productInput)
    .eq("id", id)
    .select()
    .single();

  if (productError) throw new Error(productError.message);

  const { data: existingOptions, error: existingOptionsError } = await supabase
    .from("product_options")
    .select("id")
    .eq("product_id", id);
  if (existingOptionsError) throw new Error(existingOptionsError.message);

  const nextOptionIds = new Set(options.flatMap((option) => option.id ? [option.id] : []));
  const optionDeletionPromises: Promise<void>[] = [];
  for (const option of existingOptions ?? []) {
    if (!nextOptionIds.has(option.id)) {
      optionDeletionPromises.push(
        (async () => {
          const { error } = await supabase
            .from("product_options")
            .delete()
            .eq("id", option.id)
            .eq("product_id", id);
          if (error) throw new Error(error.message);
        })()
      );
    }
  }
  await Promise.all(optionDeletionPromises);

  const optionRows = options.map(({ id: optionId, ...option }) => ({
    ...(optionId ? { id: optionId } : {}),
    ...option,
    product_id: id,
  }));
  if (optionRows.length > 0) {
    const { error } = await supabase
      .from("product_options")
      .upsert(optionRows, { onConflict: "id" });
    if (error) throw new Error(error.message);
  }

  return { ...product, product_options: options } as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}

export async function createFeaturedProduct(productId: string): Promise<void> {
  const supabase = await createClient();
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, product_options!inner(id)")
    .eq("id", productId)
    .eq("activo", true)
    .eq("product_options.activo", true)
    .maybeSingle();

  if (productError) throw productError;
  if (!product) {
    throw new Error(
      "Solo se pueden destacar productos activos con al menos una opción activa"
    );
  }

  const { count, error: countError } = await supabase
    .from("featured_products")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) >= MAX_FEATURED_PRODUCTS) {
    throw new Error("Máximo 3 productos destacados");
  }

  const { data: existingFeaturedProduct, error: existingFeaturedProductError } = await supabase
    .from("featured_products")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle();

  if (existingFeaturedProductError) throw existingFeaturedProductError;
  if (existingFeaturedProduct) {
    throw new Error("El producto ya está destacado");
  }

  const { error } = await supabase
    .from("featured_products")
    .insert({ product_id: productId, posicion: (count ?? 0) + 1 });
  if (error) throw error;
}

export async function getConfiguredFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .select("id, created_at, product_id, posicion, products(slug, nombre, descripcion)")
    .order("posicion", { ascending: true });

  if (error) throw error;
  return data as unknown as FeaturedProduct[];
}

export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("featured_products")
    .select(
      "id, created_at, product_id, posicion, products!inner(slug, nombre, descripcion, imagen_public_id, imagen_url, imagenes, product_options!inner(precio))",
    )
    .eq("products.activo", true)
    .eq("products.product_options.activo", true)
    .order("posicion", { ascending: true })
    .order("cantidad", { ascending: true, referencedTable: "products.product_options" })
    .limit(MAX_FEATURED_PRODUCTS);

  if (error) throw error;
  return data as unknown as FeaturedProduct[];
}

export async function deleteFeaturedProduct(id: string): Promise<void> {
  const supabase = await createClient();
  const { count, error: countError } = await supabase
    .from("featured_products")
    .select("id", { count: "exact", head: true });

  if (countError) throw countError;
  if ((count ?? 0) <= MIN_FEATURED_PRODUCTS) {
    throw new Error("Debe existir al menos un producto destacado");
  }

  const { data: featuredProduct, error: featuredProductError } = await supabase
    .from("featured_products")
    .select("posicion")
    .eq("id", id)
    .single();

  if (featuredProductError) throw featuredProductError;

  const { error: deleteError } = await supabase
    .from("featured_products")
    .delete()
    .eq("id", id);

  if (deleteError) throw deleteError;

  const { data: followingProducts, error: followingProductsError } = await supabase
    .from("featured_products")
    .select("id, posicion")
    .gt("posicion", featuredProduct.posicion)
    .order("posicion", { ascending: true });

  if (followingProductsError) throw followingProductsError;

  await Promise.all(
    (followingProducts ?? []).map(async (product) => {
      const { error } = await supabase
        .from("featured_products")
        .update({ posicion: product.posicion - 1 })
        .eq("id", product.id);
      if (error) throw error;
    })
  );
}
