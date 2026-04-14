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

const isSessionExpired = (session: AppSession | null) => {
  if (!session?.expiresAt) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
};

const getValidStoredSession = () => {
  const storedSession = authStorage.load();
  if (storedSession && !isSessionExpired(storedSession)) {
    return storedSession;
  }

  authStorage.clear();
  return null;
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AppSession | null>(null);
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const storedSession = getValidStoredSession();
      if (!storedSession) {
        if (isMounted) {
          setIsBootstrapped(true);
        }
        return;
      }

      try {
        const refreshedSession = await authApi.me();
        if (!isMounted) {
          return;
        }

        authStorage.save(refreshedSession);
        setSession(refreshedSession);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        if (isUnauthorizedError(error)) {
          authStorage.clear();
          setSession(null);
        } else {
          setSession(storedSession);
        }
      } finally {
        if (isMounted) {
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
    const response = await authApi.login(request);

    setSession(response);

    try {
      authStorage.save(response);
    } catch (error) {
      console.error("authStorage.save failed:", error);
    }

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
