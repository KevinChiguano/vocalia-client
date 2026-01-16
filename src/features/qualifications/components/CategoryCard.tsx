import { Edit2, Trash2, Tag } from "lucide-react";
import { Category } from "../types/category.types";
import { Button } from "@/components/ui/Button";

interface Props {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
}

export const CategoryCard = ({ category, onEdit, onDelete }: Props) => {
  return (
    <div
      className="group relative bg-surface border border-border rounded-2xl 
      shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-xl 
      hover:border-primary/40 flex flex-col h-full"
    >
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="
              w-11 h-11 sm:w-12 sm:h-12 rounded-xl 
              bg-gradient-to-br from-primary/20 to-primary/5
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300
            "
          >
            <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black text-text line-clamp-2 group-hover:text-primary ">
              {category.name}
            </h3>

            <span
              className={`
                inline-flex items-center 
                px-2.5 py-1 rounded-full 
                text-[10px] sm:text-xs font-bold uppercase tracking-wider
                ${
                  category.isActive
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/20"
                }
              `}
            >
              <span
                className={`
                  w-1.5 h-1.5 rounded-full mr-1.5
                  ${category.isActive ? "bg-emerald-500" : "bg-slate-500"}
                `}
              />
              {category.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>
        {/* Description */}
        {category.description ? (
          <div className="mb-5">
            <p className="text-sm sm:text-base text-text-muted line-clamp-2 leading-relaxed">
              {category.description}
            </p>
          </div>
        ) : (
          <div className="mb-5">
            <p className="text-sm sm:text-base text-text-muted italic opacity-60">
              No hay descripción
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(category)}
            className="
              flex-1 sm:flex-none gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden xs:inline">Editar</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(category.id)}
            className="
              px-3 sm:px-4
              hover:scale-105 active:scale-95
              transition-transform duration-200
            "
            aria-label="Eliminar categoría"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline ml-2">Eliminar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
