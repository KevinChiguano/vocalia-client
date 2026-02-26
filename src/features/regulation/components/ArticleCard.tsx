import { Badge } from "@/components/ui/Badge";
import { Info, ArrowRight, Edit } from "lucide-react";
import { RegulationArticle } from "../types/regulation.types";
import clsx from "clsx";

interface ArticleCardProps {
  article: RegulationArticle;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export const ArticleCard = ({ article, isAdmin, onEdit }: ArticleCardProps) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <Badge variant={article.badge_variant}>{article.article_num}</Badge>
          <div className="flex gap-2">
            {isAdmin && onEdit && (
              <button
                onClick={onEdit}
                className="text-text-muted hover:text-primary transition-colors p-1"
                title="Editar artículo"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            <Info className="w-4 h-4 text-text-muted mt-1" />
          </div>
        </div>

        <h3 className="type-h4 font-bold mb-3">{article.title}</h3>
        <p className="text-text-muted leading-relaxed mb-6">
          {article.description}
        </p>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
            Sanción
          </span>
          <span
            className={clsx("font-bold", {
              "text-primary": article.badge_variant === "primary",
              "text-warning": article.badge_variant === "warning",
              "text-danger": article.badge_variant === "danger",
              "text-success": article.badge_variant === "success",
              "text-info": article.badge_variant === "info",
              "text-gray-500": article.badge_variant === "neutral",
            })}
          >
            {article.sanction}
          </span>
        </div>

        <button className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors text-text">
          Ver detalles <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
