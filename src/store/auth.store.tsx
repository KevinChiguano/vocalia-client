import { create } from "zustand";
import { me as meApi } from "@/api/auth.api";
import type { User } from "@/features/auth/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("access_token"),
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("user", JSON.stringify(user));

    set({
      user,
      token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  hydrate: async () => {
    const token = get().token;
    const cachedUser = localStorage.getItem("user");

    if (!token) {
      set({ isLoading: false });
      return;
    }

    if (cachedUser) {
      set({
        user: JSON.parse(cachedUser),
        isAuthenticated: true,
        isLoading: false,
      });
      return;
    }

    try {
      const res = await meApi();
      if (res.success) {
        localStorage.setItem("user", JSON.stringify(res.data));
        set({
          user: res.data,
          isAuthenticated: true,
        });
      } else {
        get().logout();
      }
    } catch {
      get().logout();
    } finally {
      set({ isLoading: false });
    }
  },
}));
