import "server-only";
import { createAdminClient } from "@/app/shared/lib/supabase/server";

export interface ProductImageUpload {
  id: string;
  public_id: string;
  secure_url: string;
}

export async function createProductImageUpload(
  publicId: string,
  secureUrl: string,
  createdBy: string
): Promise<ProductImageUpload> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_image_uploads")
    .insert({ public_id: publicId, secure_url: secureUrl, created_by: createdBy })
    .select("id, public_id, secure_url")
    .single();

  if (error) throw error;
  return data as ProductImageUpload;
}
