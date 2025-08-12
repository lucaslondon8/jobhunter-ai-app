/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // REMOVED: VITE_ADZUNA_APP_ID and VITE_ADZUNA_APP_KEY
  // API keys should NEVER be exposed to the client with the VITE_ prefix.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
