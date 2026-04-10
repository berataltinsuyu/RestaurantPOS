import { MobileApiClient } from "../../api/http/api-client";

interface BackendHealth {
  connected: boolean;
  reason?: string;
}

export class BackendService {
  constructor(private readonly apiClient: MobileApiClient) {}

  get isConfigured() {
    return this.apiClient.isConfigured;
  }

  async getHealth(): Promise<BackendHealth> {
    if (!this.isConfigured) {
      return {
        connected: false,
        reason: "EXPO_PUBLIC_BACKEND_BASE_URL is not configured yet.",
      };
    }

    try {
      await this.apiClient.request<void>({
        method: "GET",
        path: "/health",
      });

      return {
        connected: true,
      };
    } catch {
      return {
        connected: false,
        reason:
          "The backend boundary exists, but real mobile API integration has not been enabled yet.",
      };
    }
  }
}
