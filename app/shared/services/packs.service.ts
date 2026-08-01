import "server-only";
import {
  createAdminClient,
  createClient,
} from "@/app/shared/lib/supabase/server";
import type { Pack } from "@/app/shared/types";

export interface PackWriteInput {
  product_id: string;
  cantidad: number;
  precio: number;
  activo?: boolean;
}

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

export async function getAllPacksByProductId(productId: string): Promise<Pack[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("product_id", productId)
    .order("cantidad", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Pack[];
}

export async function getPackById(id: string): Promise<Pack | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packs")
    .select("*")
    .eq("id", id)
    .single();

  if (error?.code === "PGRST116") return null;
  if (error) throw error;
  return data as Pack;
}

export async function createPack(input: PackWriteInput): Promise<Pack> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("packs")
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data as Pack;
}

export async function updatePack(
  id: string,
  input: Partial<Omit<PackWriteInput, "product_id">>
): Promise<Pack> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("packs")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Pack;
}

export async function deletePack(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("packs").delete().eq("id", id);

  if (error) throw error;
}
