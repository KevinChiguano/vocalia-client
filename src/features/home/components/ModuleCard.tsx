import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  iconBg?: string;
}

export const ModuleCard = ({
  title,
  description,
  icon: Icon,
  to,
  iconBg = "bg-primary",
}: ModuleCardProps) => {
  return (
    <Link
      to={to}
      className="group ui-card p-6 hover:shadow-lg  hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icon */}
        <div
          className={`${iconBg} w-16 h-16 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-text uppercase tracking-wide">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-text-muted leading-relaxed">{description}</p>
      </div>
    </Link>
  );
};
