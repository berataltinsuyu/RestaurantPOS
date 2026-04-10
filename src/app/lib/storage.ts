import type { AppSession } from "../types/api";

const AUTH_STORAGE_KEY = "vakifbank-restaurant-pos-auth";

const canUseStorage = () => typeof window !== "undefined";

export const authStorage = {
  load(): AppSession | null {
    if (!canUseStorage()) {
      return null;
    }

    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    try {
      return JSON.parse(rawValue) as AppSession;
    } catch {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  },

  save(session: AppSession) {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },

  clear() {
    if (!canUseStorage()) {
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  },
};
