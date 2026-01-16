import { create } from "zustand";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
};

export const useThemeStore = create<ThemeState>((set) => {
  const savedTheme = (localStorage.getItem("theme") as Theme) || "light";

  // 🔥 aplicar tema al iniciar
  applyTheme(savedTheme);

  return {
    theme: savedTheme,

    toggleTheme: () =>
      set((state) => {
        const next = state.theme === "light" ? "dark" : "light";
        applyTheme(next);
        return { theme: next };
      }),

    setTheme: (theme) =>
      set(() => {
        applyTheme(theme);
        return { theme };
      }),
  };
});
