import "server-only";
import {
  createAdminClient,
  createClient,
} from "@/app/shared/lib/supabase/server";
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

export async function updateWhatsAppConfig(
  input: Pick<WhatsAppConfig, "telefono" | "mensaje_base" | "mensaje_personalizado">
): Promise<WhatsAppConfig> {
  const supabase = createAdminClient();
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

export async function updateCartLimits(
  input: Pick<CartLimits, "max_items" | "max_quantity_per_item">
): Promise<CartLimits> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cart_limits")
    .update(input)
    .eq("id", SINGLETON_ID)
    .select()
    .single();

  if (error) throw error;
  return data as CartLimits;
}
