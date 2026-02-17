
import { createClient } from '@supabase/supabase-js';

// Tenta obter as chaves de ambos os padrões (VITE e padrão do sistema)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Log silencioso apenas para depuração, sem poluir o console como erro fatal
if (!supabase) {
  console.debug("Finanza: Supabase não configurado. O sistema operará em modo demonstração local.");
}
