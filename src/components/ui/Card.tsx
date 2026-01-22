import { ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "surface" | "primary" | "secondary";
}

export const Card = ({
  children,
  className,
  variant = "surface",
}: CardProps) => {
  const variants = {
    default: "bg-bg",
    surface: "bg-surface",
    primary: "bg-primary-soft border-primary/20",
    secondary: "bg-gray-100 dark:bg-gray-800",
  };

  return (
    <div
      className={clsx(
        "rounded-2xl border border-border p-6 shadow-sm",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={clsx(
      "font-semibold leading-none tracking-tight text-lg",
      className,
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={clsx("text-sm text-text-muted", className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("", className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx("flex items-center pt-4", className)} {...props} />
);
