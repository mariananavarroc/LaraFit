import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof globalThis !== "undefined" && "localStorage" in globalThis
        ? globalThis.localStorage
        : undefined,
    },
  },
);
