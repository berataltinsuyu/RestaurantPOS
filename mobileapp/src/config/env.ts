function resolveEnv(name: EnvName) {
  const processValue = readEnvValue(process.env[name]);

  if (processValue) {
    return {
      source: "process.env" as const,
      value: processValue,
    };
  }

  return {
    source: "missing" as const,
    value: undefined,
  };
}

function readEnvValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

type EnvName =
  | "EXPO_PUBLIC_BACKEND_BASE_URL"
  | "EXPO_PUBLIC_BRANCH_ID"
  | "EXPO_PUBLIC_ENABLE_REALTIME"
  | "EXPO_PUBLIC_ENVIRONMENT"
  | "EXPO_PUBLIC_SUPABASE_ANON_KEY"
  | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  | "EXPO_PUBLIC_SUPABASE_URL";

function readEnv(name: EnvName) {
  return resolveEnv(name).value;
}

function readNumberEnv(name: EnvName) {
  const value = readEnv(name);

  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function readBooleanEnv(name: EnvName, defaultValue: boolean) {
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

export const envDiagnostics = {
  appEnvironment: env.appEnvironment,
  backendBaseUrl: env.backend.baseUrl ?? null,
  backendBaseUrlSource: resolveEnv("EXPO_PUBLIC_BACKEND_BASE_URL").source,
  backendConfigured: Boolean(env.backend.baseUrl),
  branchId: env.branchId ?? null,
  envLoadingSucceeded:
    resolveEnv("EXPO_PUBLIC_BACKEND_BASE_URL").source !== "missing" ||
    resolveEnv("EXPO_PUBLIC_SUPABASE_URL").source !== "missing",
  realtimeEnabled: env.realtime.enabled,
  supabaseKeyPresent: Boolean(env.supabase.publishableKey),
  supabaseKeySource:
    resolveEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY").source !== "missing"
      ? resolveEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY").source
      : resolveEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY").source,
  supabaseUrlPresent: Boolean(env.supabase.url),
  supabaseUrlSource: resolveEnv("EXPO_PUBLIC_SUPABASE_URL").source,
} as const;

console.info("[env] Expo environment resolved.", envDiagnostics);
