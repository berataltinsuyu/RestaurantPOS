interface RequestArgs extends RequestInit {
  path: string;
}

export class MobileApiClient {
  constructor(private readonly baseUrl?: string) {}

  get isConfigured() {
    return Boolean(this.baseUrl);
  }

  async request<TResponse>({ path, headers, ...init }: RequestArgs) {
    if (!this.baseUrl) {
      throw new Error("Backend base URL is not configured.");
    }

    const normalizedBaseUrl = this.baseUrl.endsWith("/")
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const url = `${normalizedBaseUrl}${normalizedPath}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}.`);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }
}
