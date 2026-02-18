import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";

interface ThemeToggleProps {
  variant?: "icon" | "button";
  context?: "default" | "topbar";
}

export const ThemeToggle = ({
  variant = "icon",
  context = "default",
}: ThemeToggleProps) => {
  const { theme, toggleTheme } = useThemeStore();

  const baseIcon = "focus:outline-none focus:ring-2 rounded-full";

  const contextStyles =
    context === "topbar"
      ? "text-topbar-text hover:bg-topbar-hover focus:ring-white/30"
      : "text-text-muted hover:text-text hover:bg-hover focus:ring-primary/30";

  if (variant === "button") {
    return (
      <button
        onClick={toggleTheme}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg
          bg-surface border border-border
          text-text text-sm font-medium
          hover:bg-elevated
          focus:outline-none focus:ring-2 focus:ring-primary/30
        `}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        {theme === "dark" ? "Claro" : "Oscuro"}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      className={`${baseIcon} p-2 ${contextStyles}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
