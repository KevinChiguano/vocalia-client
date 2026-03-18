import { Badge } from "@/components/ui/Badge";
import { Edit } from "lucide-react";
import { RegulationArticle } from "../types/regulation.types";
import clsx from "clsx";

interface ArticleCardProps {
  article: RegulationArticle;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const ArticleCard = ({
  article,
  isAdmin,
  onEdit,
  onDelete,
}: ArticleCardProps) => {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <Badge variant={article.badge_variant}>{article.article_num}</Badge>
          {isAdmin && (
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-text-muted hover:text-primary transition-colors p-1"
                  title="Editar artículo"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="text-text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors p-1"
                  title="Eliminar artículo"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-trash-2"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" x2="10" y1="11" y2="17" />
                    <line x1="14" x2="14" y1="11" y2="17" />
                  </svg>
                </button>
              )}
            </div>
          )}
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
      </div>
    </div>
  );
};
