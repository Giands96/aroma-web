import { createClient } from "@/app/shared/lib/supabase/server";

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {data: { user }, error} = await supabase.auth.getUser();

  if (error) {
    console.error(error);
    return null;
  }

  return user;
}