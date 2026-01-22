import { forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost"
    | "outline"
    | "success";
  size?: "xs" | "sm" | "md" | "lg";
  loading?: boolean;
  isIconOnly?: boolean;
  pill?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      loading = false,
      isIconOnly = false,
      pill = false,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium transition-all active:scale-[0.98]",
          "focus:outline-none focus:ring-2",

          pill ? "rounded-full" : "rounded-lg",

          {
            // Variants
            "bg-primary text-white hover:bg-primary-hover focus:ring-primary/40":
              variant === "primary",

            "bg-surface border border-border text-text hover:bg-elevated focus:ring-primary/30":
              variant === "secondary",

            "bg-danger text-white hover:bg-danger/80 focus:ring-danger/40":
              variant === "danger",

            "bg-green-600 text-white hover:bg-green-700 focus:ring-green-400/40":
              variant === "success",

            "border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary/30":
              variant === "outline",

            "border border-transparent text-text-muted hover:text-text hover:bg-hover focus:ring-primary/30":
              variant === "ghost",

            // Sizes
            "text-xs": size === "xs",
            "text-sm": size === "sm" || size === "md",
            "text-base": size === "lg",

            // Normal Sizing (with labels)
            "px-2 py-1": size === "xs" && !isIconOnly,
            "px-3 py-1.5": size === "sm" && !isIconOnly,
            "px-4 py-2": size === "md" && !isIconOnly,
            "px-6 py-3": size === "lg" && !isIconOnly,

            // Icon Only Sizing (Square/Circle)
            "w-7 h-7": size === "xs" && isIconOnly,
            "w-9 h-9": size === "sm" && isIconOnly,
            "w-11 h-11": size === "md" && isIconOnly,
            "w-14 h-14": size === "lg" && isIconOnly,

            "opacity-50 cursor-not-allowed grayscale-[0.5]":
              disabled || loading,
          },
          className,
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {!isIconOnly && <span>Cargando...</span>}
          </div>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
