import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("SUPABASE URL:", supabaseUrl);
console.log("SUPABASE KEY:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Supabase NÃO configurado");
} else {
  console.log("✅ Supabase configurado corretamente");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
