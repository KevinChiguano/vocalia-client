import { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      size = "md",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && <label className="ui-label mb-1 block">{label}</label>}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={clsx(
              "ui-input",
              {
                "pl-10": leftIcon,
                "pr-10": rightIcon,
                "px-2 py-1 text-xs": size === "sm",
                "px-3 py-2 text-sm": size === "md",
                "px-4 py-3 text-base": size === "lg",
                "border-danger focus:ring-danger/40": error,
                "opacity-60 cursor-not-allowed": disabled,
              },
              className,
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="ui-error">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
