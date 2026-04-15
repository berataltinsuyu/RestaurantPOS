import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { authApi } from "../lib/api";
import { authStorage } from "../lib/storage";
import { isUnauthorizedError } from "../lib/error-utils";
import type { AppSession, LoginRequestDto } from "../types/api";

interface AuthContextValue {
  session: AppSession | null;
  isBootstrapped: boolean;
  isAuthenticated: boolean;
  login: (request: LoginRequestDto) => Promise<AppSession>;
  logout: () => void;
  updatePermissions: (permissions: string[]) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const describeSession = (session: AppSession | null | undefined) => ({
  hasSession: !!session,
  tokenPresent: !!session?.token,
  tokenLength: session?.token?.length ?? 0,
  expiresAtPresent: !!session?.expiresAt,
  expiresAt: session?.expiresAt ?? null,
  userPresent: !!session?.user,
  branchPresent: !!session?.branch,
  permissionsCount: session?.permissions?.length ?? 0,
});

const isSessionExpired = (session: AppSession | null) => {
  if (!session?.expiresAt) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
};

const getValidStoredSession = () => {
  const storedSession = authStorage.load();
  console.log("[AUTH] bootstrap stored session", describeSession(storedSession));
  if (storedSession && !isSessionExpired(storedSession)) {
    console.log("[AUTH] bootstrap resolved valid session", describeSession(storedSession));
    return storedSession;
  }

  console.log("[AUTH] bootstrap resolved valid session", {
    hasSession: false,
    reason: "missing-or-expired-session",
  });
  authStorage.clear();
  return null;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AppSession | null>(() => getValidStoredSession());
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      console.log("[AUTH] bootstrap start");
      const storedSession = getValidStoredSession();
      if (!storedSession) {
        if (isMounted) {
          console.log("[AUTH] bootstrap done");
          setIsBootstrapped(true);
        }
        return;
      }

      try {
        console.log("[AUTH] bootstrap auth/me start");
        const refreshedSession = await authApi.me();
        if (!isMounted) {
          return;
        }

        console.log("[AUTH] bootstrap auth/me success", describeSession(refreshedSession));
        authStorage.save(refreshedSession);
        setSession(refreshedSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isUnauthorizedError(error)) {
          console.log("[AUTH] bootstrap auth/me 401");
          authStorage.clear();
          setSession(null);
        } else {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
          console.log("[AUTH] bootstrap done");
          setIsBootstrapped(true);
        }
      }
    };

    void bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const logout = useCallback(() => {
    authStorage.clear();
    setSession(null);
  }, []);

  const updatePermissions = useCallback((permissions: string[]) => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const nextSession = {
        ...currentSession,
        permissions: [...new Set(permissions)],
      };

      authStorage.save(nextSession);
      return nextSession;
    });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
      if (window.location.pathname !== "/") {
        window.location.assign("/");
      }
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [logout]);

  const login = useCallback(async (request: LoginRequestDto) => {
    console.log("[AUTH] login start", {
      branchCode: request.branchCode ?? null,
      branchId: request.branchId ?? null,
      userName: request.userName,
      passwordPresent: !!request.password,
    });
    const response = await authApi.login(request);
    console.log("[AUTH] login response", describeSession(response));

    console.log("[AUTH] before storage save", describeSession(response));
    authStorage.save(response);
    console.log("[AUTH] after storage save");
    console.log("[AUTH] storage load immediately after save", describeSession(authStorage.load()));
    console.log("[AUTH] before setSession", describeSession(response));
    setSession(response);
    console.log("[AUTH] after setSession", describeSession(response));

    return response;
  }, []);

  const resolvedSession = useMemo(
    () => (session && !isSessionExpired(session) ? session : getValidStoredSession()),
    [session],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      session: resolvedSession,
      isBootstrapped,
      isAuthenticated: !!resolvedSession,
      login,
      logout,
      updatePermissions,
    }),
    [isBootstrapped, login, logout, resolvedSession, updatePermissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
