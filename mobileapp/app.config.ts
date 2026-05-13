import type { ExpoConfig } from "expo/config";

function parseBooleanLikeValue(value: string | undefined) {
  if (!value) return undefined;

  const normalized = value
    .trim()
    .replace(/^(['"])(.*)\1$/, "$2")
    .toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  )
    return true;

  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no" ||
    normalized === "off"
  )
    return false;

  return undefined;
}

const config: ExpoConfig = {
  name: "RestaurantPOS Waiter Mobile",
  slug: "restaurantpos-waiter-mobile",
  scheme: "restaurantposmobile",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  assetBundlePatterns: ["**/*"],
  android: {
    package: "com.restaurantpos.waitermobile",
  },
  ios: {
    bundleIdentifier: "com.restaurantpos.waitermobile",
  },
  extra: {
    owner: "RestaurantPOS",
    EXPO_PUBLIC_BACKEND_BASE_URL:
      process.env.EXPO_PUBLIC_BACKEND_BASE_URL ?? null,
    EXPO_PUBLIC_BRANCH_ID: process.env.EXPO_PUBLIC_BRANCH_ID ?? null,
    EXPO_PUBLIC_ENABLE_REALTIME:
      parseBooleanLikeValue(process.env.EXPO_PUBLIC_ENABLE_REALTIME) ?? null,
    EXPO_PUBLIC_ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT ?? null,
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? null,
    EXPO_PUBLIC_SUPABASE_ANON_KEY:
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? null,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? null,
  },
};

export default config;
