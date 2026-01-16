import { Loader2 } from "lucide-react";

interface InlineSpinnerProps {
  className?: string;
  size?: number | string;
  label?: string;
}

export const InlineSpinner = ({
  className = "",
  size = 24,
  label,
}: InlineSpinnerProps) => {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Loader2
        className="text-primary animate-spin"
        style={{ width: size, height: size }}
      />
      {label && (
        <span className="text-sm text-text-muted animate-pulse">{label}</span>
      )}
    </div>
  );
};
