import "server-only";
import {
  createAdminClient,
  createClient,
} from "@/app/shared/lib/supabase/server";
import type { ProductOptionInput } from "@/app/shared/lib/validations/product-option.schema";
import type { Product } from "@/app/shared/types";

export interface ProductWriteInput {
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_public_id?: string | null;
  imagen_url?: string | null;
  activo?: boolean;
}

export type ProductOptionWriteInput = ProductOptionInput & { id?: string };

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
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

export async function createProductWithOptions(
  productInput: ProductWriteInput,
  options: ProductOptionWriteInput[],
  imageUploadId?: string
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_product_with_options", {
      product_data: productInput,
      option_data: options,
      image_upload_id: imageUploadId ?? null,
    })
    .single();

  if (error) throw error;
  return data as Product;
}

export async function updateProduct(
  id: string,
  input: Partial<ProductWriteInput>
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("update_product_with_options", {
      target_product_id: id,
      product_data: input,
      option_data: null,
      image_upload_id: null,
    })
    .single();

  if (error) throw error;
  return data as Product;
}

export async function clearProductImage(
  id: string,
  expectedPublicId: string
): Promise<Product | null> {
  const supabase = createAdminClient();
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
  options: ProductOptionWriteInput[] | undefined,
  imageUploadId?: string
): Promise<Product> {
  const optionIds = options?.flatMap((option) => (option.id ? [option.id.toLowerCase()] : [])) ?? [];
  if (new Set(optionIds).size !== optionIds.length) {
    throw new Error("Duplicate product option IDs are not allowed");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("update_product_with_options", {
      target_product_id: id,
      product_data: productInput,
      option_data: options ?? null,
      image_upload_id: imageUploadId ?? null,
    })
    .single();

  if (error) throw error;
  return data as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;
}
