import type { AppSession } from "../types/api";

const AUTH_STORAGE_KEY = "vakifbank-restaurant-pos-auth";

const canUseStorage = () => typeof window !== "undefined";

const describeSession = (session: AppSession | null | undefined) => ({
  hasSession: !!session,
  tokenPresent: !!session?.token,
  tokenLength: session?.token?.length ?? 0,
  expiresAtPresent: !!session?.expiresAt,
  userPresent: !!session?.user,
  branchPresent: !!session?.branch,
  permissionsCount: session?.permissions?.length ?? 0,
});

let inMemorySession: AppSession | null = null;

export const sessionMemory = {
  get: () => inMemorySession,
  set: (session: AppSession | null) => {
    inMemorySession = session;
  },
};

export const authStorage = {
  load(): AppSession | null {
    console.log("[STORAGE] load called");

    const memorySession = sessionMemory.get();
    if (memorySession) {
      console.log("[STORAGE] load result", {
        source: "memory",
        ...describeSession(memorySession),
      });
      return memorySession;
    }

    if (!canUseStorage()) {
      return null;
    }

    try {
      const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!rawValue) {
        console.log("[STORAGE] load result", {
          source: "localStorage",
          hasRawValue: false,
          hasSession: false,
        });
        return null;
      }

      const parsedSession = JSON.parse(rawValue) as AppSession;
      console.log("[STORAGE] load result", {
        source: "localStorage",
        hasRawValue: true,
        ...describeSession(parsedSession),
      });
      return parsedSession;
    } catch (error) {
      console.error("[STORAGE] load failed", error);
      try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
      return null;
    }
  },

  save(session: AppSession) {
    console.log("[STORAGE] save called", describeSession(session));
    console.log("[STORAGE] save key", AUTH_STORAGE_KEY);
    sessionMemory.set(session);

    if (!canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      console.log("[STORAGE] save success", {
        key: AUTH_STORAGE_KEY,
        ...describeSession(session),
      });
    } catch (error) {
      console.error("[STORAGE] save failed", error);
    }
  },

  clear() {
    console.log("[STORAGE] clear called", { key: AUTH_STORAGE_KEY });
    sessionMemory.set(null);

    if (!canUseStorage()) {
      return;
    }

    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error("authStorage.clear failed:", error);
    }
  },
};
