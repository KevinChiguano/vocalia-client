import { forwardRef } from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="ui-label mb-1 block">{label}</label>}
        <textarea
          ref={ref}
          disabled={disabled}
          className={clsx(
            "ui-input min-h-[80px]",
            {
              "border-danger focus:ring-danger/40": error,
              "opacity-60 cursor-not-allowed": disabled,
            },
            className,
          )}
          {...props}
        />
        {error && <p className="ui-error">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";
