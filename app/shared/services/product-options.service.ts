import "server-only";
import {
  createAdminClient,
  createClient,
} from "@/app/shared/lib/supabase/server";
import type { ProductOption } from "@/app/shared/types";

export interface ProductOptionWriteInput {
  product_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  activo?: boolean;
}

export async function getProductOptionsByProductId(
  productId: string
): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_options")
    .select("*")
    .eq("product_id", productId)
    .eq("activo", true)
    .order("cantidad", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductOption[];
}

export async function getAllProductOptionsByProductId(
  productId: string
): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_options")
    .select("*")
    .eq("product_id", productId)
    .order("cantidad", { ascending: true });

  if (error) throw error;
  return (data ?? []) as ProductOption[];
}

export async function getProductOptionById(
  id: string
): Promise<ProductOption | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_options")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as ProductOption;
}

export async function createProductOption(
  input: ProductOptionWriteInput
): Promise<ProductOption> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_options")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as ProductOption;
}

export async function updateProductOption(
  id: string,
  input: Partial<Omit<ProductOptionWriteInput, "product_id">>
): Promise<ProductOption> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("update_product_option", {
      target_option_id: id,
      option_data: input,
    })
    .single();

  if (error) throw error;
  return data as ProductOption;
}

export async function deleteProductOption(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_product_option", {
    target_option_id: id,
  });

  if (error) throw error;
}
