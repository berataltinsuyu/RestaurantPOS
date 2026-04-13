import { ApiRequestError, MobileApiClient } from "../../api/http/api-client";
import { env, envDiagnostics } from "../../config/env";

interface BackendLoginRequest {
  branchId?: number;
  branchCode?: string;
  userName: string;
  password: string;
}

interface BackendLoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: number;
    fullName: string;
    userName: string;
    branchId?: number | null;
  };
  branch: {
    id: number;
    name: string;
  };
  permissions: string[];
}

interface BackendHealth {
  connected: boolean;
  reason?: string;
}

export class BackendService {
  constructor(private readonly apiClient: MobileApiClient) {}

  get isConfigured() {
    return this.apiClient.isConfigured;
  }

  clearSession() {
    this.apiClient.setAuthToken(undefined);
  }

  async login(request: BackendLoginRequest): Promise<BackendLoginResponse> {
    const resolvedBranchId = request.branchId ?? env.branchId;
    const payload =
      resolvedBranchId !== undefined
        ? {
            BranchId: resolvedBranchId,
            Password: request.password,
            UserName: request.userName,
          }
        : request.branchCode
          ? {
              BranchCode: request.branchCode,
              Password: request.password,
              UserName: request.userName,
            }
          : {
              Password: request.password,
              UserName: request.userName,
            };

    console.info("[BackendService] Login started.", {
      backendBaseUrl: env.backend.baseUrl ?? null,
      backendConfigured: envDiagnostics.backendConfigured,
      backendBaseUrlSource: envDiagnostics.backendBaseUrlSource,
      branchCode: request.branchCode ?? null,
      branchId: resolvedBranchId ?? null,
      envLoadingSucceeded: envDiagnostics.envLoadingSucceeded,
      endpointPath: "/api/auth/login",
      payloadShape: {
        ...("BranchCode" in payload ? { BranchCode: payload.BranchCode } : {}),
        ...("BranchId" in payload ? { BranchId: payload.BranchId } : {}),
        Password: "***",
        UserName: payload.UserName,
      },
      userName: request.userName,
    });

    if (!("BranchId" in payload) && !("BranchCode" in payload)) {
      console.error("[BackendService] Login branch context is missing.", {
        branchCode: request.branchCode ?? null,
        branchId: resolvedBranchId ?? null,
      });
    }

    try {
      const response = await this.apiClient.request<BackendLoginResponse>({
        body: JSON.stringify(payload),
        debugBody: {
          ...("BranchCode" in payload ? { BranchCode: payload.BranchCode } : {}),
          ...("BranchId" in payload ? { BranchId: payload.BranchId } : {}),
          Password: "***",
          UserName: payload.UserName,
        },
        method: "POST",
        path: "/api/auth/login",
      });

      this.apiClient.setAuthToken(response.token);
      console.info("[BackendService] Login completed.", {
        branchId: response.branch.id,
        expiresAt: response.expiresAt,
        permissionCount: response.permissions.length,
        userId: response.user.id,
      });

      return response;
    } catch (error) {
      if (error instanceof ApiRequestError) {
        console.error("[BackendService] Login failed.", {
          backendBaseUrl: env.backend.baseUrl ?? null,
          backendBaseUrlSource: envDiagnostics.backendBaseUrlSource,
          endpointPath: error.path,
          responseBody: error.responseBody ?? null,
          status: error.status,
          url: error.url ?? null,
        });
      } else {
        console.error("[BackendService] Login failed with unexpected error.", error);
      }

      throw error;
    }
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
