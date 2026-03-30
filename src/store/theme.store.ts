import { create } from "zustand";
import { applyTheme } from "@/theme/initTheme";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const savedTheme = (localStorage.getItem("theme") as Theme) || "light";

  return {
    theme: savedTheme,

    toggleTheme: () => {
      const { theme } = get();
      const next = theme === "light" ? "dark" : "light";
      applyTheme(next);
      set({ theme: next });
    },

    setTheme: (theme) => {
      applyTheme(theme);
      set({ theme });
    },
  };
});
