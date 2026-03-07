// Cliente Supabase central. Inserta tus claves en un archivo .env:
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
import { createClient } from "@supabase/supabase-js";

const FALLBACK_SUPABASE_URL = "https://ooiklfrvtokofzomzksu.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9vaWtsZnJ2dG9rb2Z6b216a3N1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTM5MzksImV4cCI6MjA4NjI2OTkzOX0.ZkCXINEo0NqquMFfhVf4ZXu-XyCMLGgigQp-Gcu4YFE";

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nota: coloca las credenciales en .env (raíz) como:
// VITE_SUPABASE_URL=https://xyz.supabase.co
// VITE_SUPABASE_ANON_KEY=public-anon-key
