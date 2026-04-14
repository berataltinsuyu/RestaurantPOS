import { env } from "../config/env";
import { authStorage, sessionMemory } from "./storage";

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  body?: unknown;
};

let resolvedApiBaseUrl = env.apiBaseUrl;

const getApiBaseCandidates = () => {
  const uniqueCandidates = [resolvedApiBaseUrl, ...env.apiBaseUrls];
  return uniqueCandidates.filter((value, index) => uniqueCandidates.indexOf(value) === index);
};

const getErrorMessage = async (response: Response) => {
  if (response.status === 401) {
    return "Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.";
  }

  if (response.status === 403) {
    return "Bu alana erişim yetkiniz bulunmuyor.";
  }

  if (response.status >= 500) {
    return "İşlem sırasında beklenmeyen bir hata oluştu.";
  }

  const resolvePayloadMessage = (payload: unknown) => {
    if (typeof payload === "string") {
      return payload;
    }

    if (payload && typeof payload === "object") {
      const typedPayload = payload as {
        message?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };

      if (typedPayload.message) {
        return typedPayload.message;
      }

      if (typedPayload.title) {
        return typedPayload.title;
      }

      if (typedPayload.errors) {
        const firstError = Object.values(typedPayload.errors).flat().find(Boolean);
        if (firstError) {
          return firstError;
        }
      }
    }

    return null;
  };

  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      const payloadMessage = resolvePayloadMessage(payload);
      if (payloadMessage) {
        return payloadMessage;
      }
    }

    const text = await response.text();
    if (!text) {
      return "İstek işlenemedi.";
    }

    try {
      const payload = JSON.parse(text);
      const payloadMessage = resolvePayloadMessage(payload);
      if (payloadMessage) {
        return payloadMessage;
      }
      return "İstek işlenemedi.";
    } catch {
      if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
        return "İstek işlenemedi.";
      }

      return text;
    }
  } catch {
    return "İstek işlenemedi.";
  }
};

export async function apiRequest<T>(
  path: string,
  { auth = true, headers, body, ...options }: RequestOptions = {},
): Promise<T> {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (auth) {
    const session = authStorage.load() ?? sessionMemory.get();
    if (session?.token) {
      requestHeaders.set("Authorization", `Bearer ${session.token}`);
    }
  }

  let response: Response | null = null;
  let networkError: unknown;

  for (const apiBaseUrl of getApiBaseCandidates()) {
    try {
      response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      resolvedApiBaseUrl = apiBaseUrl;
      break;
    } catch (error) {
      networkError = error;
    }
  }

  if (!response) {
    throw new ApiError(
      "Sunucuya bağlanılamadı. API adresini ve backend servisinin çalıştığını kontrol edin.",
      0,
      networkError,
    );
  }

  if (!response.ok) {
    const message = await getErrorMessage(response);

    if (response.status === 401) {
      authStorage.clear();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const buildQueryString = (params: Record<string, string | number | undefined | null>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
