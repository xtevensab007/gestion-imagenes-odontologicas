import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
export async function obtenerTokenSesion() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;

  return data.session?.access_token;
}