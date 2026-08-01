import "server-only";
import {
  createAdminClient,
  createClient,
} from "@/app/shared/lib/supabase/server";
import type { PackInput } from "@/app/shared/lib/validations/pack.schema";
import type { Product } from "@/app/shared/types";

export interface ProductWriteInput {
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_public_id?: string | null;
  imagen_url?: string | null;
  activo?: boolean;
}

export type ProductPackWriteInput = PackInput & { id?: string };

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

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, packs(*)")
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
    .select("*, packs(*)")
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

export async function createProductWithPacks(
  productInput: ProductWriteInput,
  packs: ProductPackWriteInput[],
  imageUploadId?: string
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("create_product_with_packs", {
      product_data: productInput,
      pack_data: packs,
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
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(input)
    .eq("id", id)
    .select()
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

export async function updateProductWithPacks(
  id: string,
  productInput: Partial<ProductWriteInput>,
  packs: ProductPackWriteInput[] | undefined,
  imageUploadId?: string
): Promise<Product> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("update_product_with_packs", {
      target_product_id: id,
      product_data: productInput,
      pack_data: packs ?? null,
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
