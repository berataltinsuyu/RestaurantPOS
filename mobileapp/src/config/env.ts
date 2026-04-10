function readEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumberEnv(name: string) {
  const value = readEnv(name);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBooleanEnv(name: string, defaultValue: boolean) {
  const value = readEnv(name);

  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  const parsedJson = (() => {
    try {
      return JSON.parse(normalized);
    } catch {
      return undefined;
    }
  })();

  if (typeof parsedJson === "boolean") {
    return parsedJson;
  }

  if (normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }

  if (normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }

  return defaultValue;
}

export const env = {
  appEnvironment: readEnv("EXPO_PUBLIC_ENVIRONMENT") ?? "development",
  backend: {
    baseUrl: readEnv("EXPO_PUBLIC_BACKEND_BASE_URL"),
  },
  branchId: readNumberEnv("EXPO_PUBLIC_BRANCH_ID"),
  realtime: {
    enabled: readBooleanEnv("EXPO_PUBLIC_ENABLE_REALTIME", true),
  },
  supabase: {
    publishableKey:
      readEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ??
      readEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
    url: readEnv("EXPO_PUBLIC_SUPABASE_URL"),
  },
} as const;
