import { forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "focus:outline-none focus:ring-2",

          {
            "bg-primary text-white hover:bg-primary-hover focus:ring-primary/40":
              variant === "primary",

            "bg-surface border border-border text-text hover:bg-elevated focus:ring-primary/30":
              variant === "secondary",

            "bg-danger text-white hover:bg-danger/80 focus:ring-danger/40":
              variant === "danger",

            "border border-transparent text-text-muted hover:text-text hover:bg-hover focus:ring-primary/30":
              variant === "ghost",

            "px-4 py-2 text-sm": size === "md",
            "px-3 py-1.5 text-sm": size === "sm",

            "opacity-50 cursor-not-allowed": disabled || loading,
          },
          className
        )}
        {...props}
      >
        {loading ? "Cargando..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
