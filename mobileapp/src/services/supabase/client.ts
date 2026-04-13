import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { env, envDiagnostics } from "../../config/env";
import { Database } from "../../types/supabase";

let cachedClient: SupabaseClient<Database> | null = null;
let hasLoggedClientCreation = false;
let hasLoggedMissingConfig = false;

export function isSupabaseConfigured() {
  return Boolean(env.supabase.url && env.supabase.publishableKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    if (!hasLoggedMissingConfig) {
      console.error("[SupabaseClient] Missing Supabase configuration.", {
        ...envDiagnostics,
        note:
          "Create mobileapp/.env from .env.example and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      });
      hasLoggedMissingConfig = true;
    }

    return null;
  }

  if (!cachedClient) {
    if (!hasLoggedClientCreation) {
      console.log(
        "[Supabase] Creating client with:",
        env.supabase.url,
        env.supabase.publishableKey,
      );
      console.info("[SupabaseClient] Creating Supabase client.", envDiagnostics);
      hasLoggedClientCreation = true;
    }

    cachedClient = createClient(
      env.supabase.url as string,
      env.supabase.publishableKey as string,
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      },
    );
  }

  return cachedClient;
}
