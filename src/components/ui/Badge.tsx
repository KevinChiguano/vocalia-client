import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "neutral"
    | "tournament"
    | "outline";
  className?: string;
  size?: "xs" | "sm";
}

export const Badge = ({
  children,
  variant = "neutral",
  className,
  size = "xs",
}: BadgeProps) => {
  return (
    <div
      className={clsx(
        "inline-flex items-center rounded-full font-bold uppercase tracking-wider border",
        {
          "px-2 py-0.5 text-[9px]": size === "xs",
          "px-2.5 py-1 text-[10px]": size === "sm",
        },
        {
          "bg-primary-soft text-primary border-primary/20":
            variant === "primary",
          "bg-success-soft text-success border-success/20":
            variant === "success",
          "bg-danger-soft text-danger border-danger/20": variant === "danger",
          "bg-warning-soft text-warning border-warning/20":
            variant === "warning",
          "bg-info-soft text-info border-info/20": variant === "info",
          "bg-tournament-soft text-tournament border-tournament/20":
            variant === "tournament",
          "bg-gray-500/10 text-gray-500 border-gray-500/20":
            variant === "neutral",
          "bg-transparent border-border text-text": variant === "outline",
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
