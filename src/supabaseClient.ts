import { createClient } from '@supabase/supabase-js';

// ¡IMPORTANTE! NO pegues tus claves directamente aquí en un proyecto real.
// En su lugar, usa variables de entorno para mayor seguridad.
// Para Vite, crea un archivo .env.local en la raíz de tu proyecto
// y añade las variables como:
// VITE_SUPABASE_URL="https://tu_url_de_supabase.supabase.co"
// VITE_SUPABASE_ANON_KEY="tu_clave_anon_public"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);