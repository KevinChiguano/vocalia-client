import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronsUpDown } from "lucide-react";
import { clsx } from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, className, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={clsx(
              "w-full appearance-none rounded-lg border border-border bg-surface py-2.5 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed",
              icon ? "pl-9" : "pl-4",
              "pr-10",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <ChevronsUpDown className="w-4 h-4" />
          </div>
        </div>
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";
