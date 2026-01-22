import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  variant?: "primary" | "muted";
}

export const SectionHeader = ({
  title,
  icon: Icon,
  className,
  variant = "primary",
}: SectionHeaderProps) => {
  return (
    <h3
      className={clsx(
        "text-sm font-bold uppercase tracking-wider flex items-center gap-2",
        variant === "primary" ? "text-primary" : "text-text-muted",
        className,
      )}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {title}
    </h3>
  );
};
