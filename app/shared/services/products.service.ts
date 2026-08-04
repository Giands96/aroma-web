import "server-only";
import { createClient } from "@/app/shared/lib/supabase/server";
import type { ProductOptionInput } from "@/app/shared/lib/validations/product-option.schema";
import type { ProductImage } from "@/app/shared/lib/validations/product-image.schema";
import type { Product } from "@/app/shared/types/product.types";

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
  for (const option of existingOptions ?? []) {
    if (!nextOptionIds.has(option.id)) {
      const { error } = await supabase
        .from("product_options")
        .delete()
        .eq("id", option.id)
        .eq("product_id", id);
      if (error) throw new Error(error.message);
    }
  }

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
