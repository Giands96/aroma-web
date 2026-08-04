import { createClient } from "@/app/shared/lib/supabase/server";

export async function requireAdmin() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error("Unauthorized");
    }

    const { data: admin, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !admin) {
      throw new Error("Unauthorized");
    }

    return user;
  } catch {
    throw new Error("Unauthorized");
  }
}
