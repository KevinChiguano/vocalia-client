import { ReactNode } from "react";
import { clsx } from "clsx";

interface PageHeaderProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
  hideOnPrint?: boolean;
}

export const PageHeader = ({
  title,
  description,
  actions,
  className,
  hideOnPrint = true,
}: PageHeaderProps) => {
  return (
    <div
      className={clsx(
        "flex flex-col md:flex-row md:items-end justify-between gap-4",
        hideOnPrint && "print:hidden",
        className,
      )}
    >
      <div className="space-y-1">
        <h1 className="type-h2 font-black">
          {typeof title === "string" ? title : title}
        </h1>
        {description && <p className="text-text-muted">{description}</p>}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
};
