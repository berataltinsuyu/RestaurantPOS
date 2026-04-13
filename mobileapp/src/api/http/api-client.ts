import { Platform } from "react-native";
import { envDiagnostics } from "../../config/env";

interface RequestArgs extends RequestInit {
  path: string;
  debugBody?: unknown;
  debugResponseBody?: boolean;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly path: string,
    public readonly responseBody?: string,
    public readonly url?: string,
    public readonly method?: string,
    public readonly requestBody?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export class MobileApiClient {
  private authToken?: string;

  constructor(private readonly baseUrl?: string) {}

  get isConfigured() {
    return Boolean(this.baseUrl);
  }

  setAuthToken(token?: string) {
    this.authToken = token;
  }

  async request<TResponse>({
    path,
    headers,
    debugBody,
    debugResponseBody = false,
    ...init
  }: RequestArgs) {
    if (!this.baseUrl) {
      console.error("[MobileApiClient] Backend base URL is missing.", {
        envDiagnostics,
      });

      throw new Error(
        "Backend base URL is not configured. Set EXPO_PUBLIC_BACKEND_BASE_URL in mobileapp/.env and restart Expo with a cleared cache if needed.",
      );
    }

    const normalizedBaseUrl = normalizeBaseUrl(this.baseUrl);
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${normalizedBaseUrl}${normalizedPath}`;
    const method = init.method ?? "GET";
    const requestBody = serializeLoggedBody(debugBody ?? init.body);

    console.info("[MobileApiClient] Request started.", {
      hasAuthToken: Boolean(this.authToken),
      method,
      path: normalizedPath,
      requestBody,
      url,
    });

    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(this.authToken
          ? {
              Authorization: `Bearer ${this.authToken}`,
            }
          : {}),
        "Content-Type": "application/json",
        ...headers,
      },
    });

    console.info("[MobileApiClient] Response received.", {
      method,
      path: normalizedPath,
      status: response.status,
    });

    if (!response.ok) {
      const responseBody = await response.text();

      console.error("[MobileApiClient] Request failed.", {
        method,
        path: normalizedPath,
        requestBody,
        responseBody,
        status: response.status,
        url,
      });

      throw new ApiRequestError(
        `API request failed with status ${response.status}.`,
        response.status,
        normalizedPath,
        responseBody,
        url,
        method,
        requestBody,
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const responseBody = (await response.json()) as TResponse;

    if (debugResponseBody) {
      console.info("[MobileApiClient] Response body received.", {
        method,
        path: normalizedPath,
        responseBody,
        status: response.status,
      });
    }

    return responseBody;
  }
}

export function getBackendErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ApiRequestError) {
    const parsedMessage = parseBackendErrorBody(error.responseBody);

    if (parsedMessage) {
      return parsedMessage;
    }

    if (error.status === 401) {
      return "Oturum doğrulanamadı. Lütfen tekrar giriş yapın.";
    }

    if (error.status === 403) {
      if (error.path.startsWith("/api/payments")) {
        return "Bu kullanıcı hesabı ödeme işlemi için yetkili değil. Kasiyer, Şube Müdürü veya Yönetici hesabıyla giriş yapın.";
      }

      return "Bu işlem için yetkiniz bulunmuyor.";
    }

    if (error.status === 404) {
      return "İstenen backend endpoint'i bulunamadı.";
    }

    return `Backend isteği başarısız oldu (HTTP ${error.status}).`;
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallbackMessage;
}

function parseBackendErrorBody(responseBody?: string) {
  if (!responseBody) {
    return null;
  }

  const trimmed = responseBody.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as
      | {
          error?: unknown;
          detail?: unknown;
          errors?: Record<string, unknown>;
          title?: unknown;
        }
      | string;

    if (typeof parsed === "string" && parsed.trim().length > 0) {
      return parsed.trim();
    }

    if (parsed && typeof parsed === "object") {
      if (typeof parsed.error === "string" && parsed.error.trim().length > 0) {
        return parsed.error.trim();
      }

      if (typeof parsed.detail === "string" && parsed.detail.trim().length > 0) {
        return parsed.detail.trim();
      }

      if (typeof parsed.title === "string" && parsed.title.trim().length > 0) {
        const validationMessages = flattenValidationErrors(parsed.errors);

        if (validationMessages.length) {
          return `${parsed.title.trim()} ${validationMessages.join(" ")}`.trim();
        }

        return parsed.title.trim();
      }

      const validationMessages = flattenValidationErrors(parsed.errors);

      if (validationMessages.length) {
        return validationMessages.join(" ");
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function flattenValidationErrors(errors: Record<string, unknown> | undefined) {
  if (!errors) {
    return [];
  }

  return Object.values(errors).flatMap((value) => {
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim().length > 0) {
      return [value.trim()];
    }

    return [];
  });
}

function serializeLoggedBody(body: unknown) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === "string") {
    return body;
  }

  if (typeof body === "object") {
    try {
      return JSON.stringify(body);
    } catch {
      return "[unserializable body]";
    }
  }

  return String(body);
}

function normalizeBaseUrl(baseUrl: string) {
  const trimmed = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

  if (Platform.OS !== "android") {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      parsed.hostname = "10.0.2.2";
      const normalized = parsed.toString().replace(/\/$/, "");

      console.info("[MobileApiClient] Android emulator localhost remapped.", {
        normalizedBaseUrl: normalized,
        originalBaseUrl: trimmed,
      });

      return normalized;
    }
  } catch {
    console.warn("[MobileApiClient] Backend base URL could not be parsed.", {
      baseUrl: trimmed,
    });
  }

  return trimmed;
}
