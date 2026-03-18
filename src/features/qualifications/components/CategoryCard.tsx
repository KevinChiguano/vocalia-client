import { Edit2, Trash2, Tag } from "lucide-react";
import clsx from "clsx";
import { Category } from "../types/category.types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <div className="flex items-start gap-4 mb-4">
          <div
            className="
              w-11 h-11 sm:w-12 sm:h-12 rounded-xl 
              bg-linear-to-br from-primary/20 to-primary/5
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

            <Badge
              variant={category.isActive ? "success" : "neutral"}
              size="sm"
            >
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  category.isActive ? "bg-success" : "bg-gray-500",
                )}
              />
              {category.isActive ? "Activo" : "Inactivo"}
            </Badge>
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
        <div className="flex gap-2 pt-4 mt-auto border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(category)}
            className="flex-1 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(category.id)}
            className="px-3 md:px-4"
            aria-label="Eliminar categoría"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
