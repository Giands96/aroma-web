import "server-only";
import {unstable_cache} from "next/cache";
import { createClient, createPublicClient } from "@/app/shared/lib/supabase/server";
import type { CartLimits, WhatsAppConfig } from "@/app/shared/types";

const SINGLETON_ID = "00000000-0000-0000-0000-000000000001";
const SINGLETON_KEY = "principal";
export const DEFAULT_WHATSAPP_CONFIG: WhatsAppConfig = {
  clave: SINGLETON_KEY,
  telefono: "",
  mensaje_carrito: "Hola, quiero información sobre mi carrito.",
  mensaje_producto: "Hola, quiero información sobre {producto_name}.",
};
export const PUBLIC_WHATSAPP_CONFIG_CACHE_TAG = "public-whatsapp-config";

const getCachedPublicWhatsAppConfig = unstable_cache(
  async (): Promise<WhatsAppConfig> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("whatsapp_config")
      .select("clave, telefono, mensaje_carrito, mensaje_producto")
      .eq("clave", SINGLETON_KEY)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return (data as WhatsAppConfig) ?? DEFAULT_WHATSAPP_CONFIG;
  },
  ["public-whatsapp-config"],
  {
    revalidate: 300,
    tags: [PUBLIC_WHATSAPP_CONFIG_CACHE_TAG],
  },
);

export function getPublicWhatsAppConfig(): Promise<WhatsAppConfig> {
  return getCachedPublicWhatsAppConfig();
}


export async function getWhatsAppConfig(): Promise<WhatsAppConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_config")
    .select("*")
    .eq("clave", SINGLETON_KEY)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as WhatsAppConfig) ?? DEFAULT_WHATSAPP_CONFIG;
}

export async function updateWhatsAppConfig(
  input: Pick<WhatsAppConfig, "telefono" | "mensaje_carrito" | "mensaje_producto">
): Promise<WhatsAppConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("whatsapp_config")
    .upsert({ clave: SINGLETON_KEY, ...input }, { onConflict: "clave" })
    .select()
    .single();

  if (error) throw new Error(error.message);
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
