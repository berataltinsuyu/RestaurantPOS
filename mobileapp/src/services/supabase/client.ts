import "react-native-url-polyfill/auto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import { env } from "../../config/env";
import { Database } from "../../types/supabase";

let cachedClient: SupabaseClient<Database> | null = null;

export function isSupabaseConfigured() {
  return Boolean(env.supabase.url && env.supabase.publishableKey);
}

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!cachedClient) {
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
