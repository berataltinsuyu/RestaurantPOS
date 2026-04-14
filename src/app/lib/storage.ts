import type { AppSession } from "../types/api";

const AUTH_STORAGE_KEY = "vakifbank-restaurant-pos-auth";

const canUseStorage = () => typeof window !== "undefined";

export const authStorage = {
  load(): AppSession | null {
    if (!canUseStorage()) {
      return null;
    }

    try {
      const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!rawValue) {
        return null;
      }

      return JSON.parse(rawValue) as AppSession;
    } catch (error) {
      console.error("authStorage.load failed:", error);
      try {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
      return null;
    }
  },

  save(session: AppSession) {
    if (!canUseStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error("authStorage.save failed:", error);
      throw error;
    }
  },

  clear() {
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