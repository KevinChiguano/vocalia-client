import { Edit2, Trash2, MapPin } from "lucide-react";
import { Field } from "../types/field.types";
import { Button } from "@/components/ui/Button";

interface Props {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete: (id: number) => void;
}

export const FieldCard = ({ field, onEdit, onDelete }: Props) => {
  const handleShowMap = () => {
    if (!field.location) return;

    // Check if it's already a URL
    if (
      field.location.startsWith("http://") ||
      field.location.startsWith("https://")
    ) {
      window.open(field.location, "_blank");
    } else {
      // Otherwise search on Google Maps
      const query = encodeURIComponent(field.location);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        "_blank",
      );
    }
  };

  return (
    <div
      className="group relative bg-surface border border-border rounded-2xl 
      shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-xl 
      hover:border-primary/40 flex flex-col h-full"
    >
      <div className="p-5 sm:p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div
            className="
              w-11 h-11 sm:w-12 sm:h-12 rounded-xl 
              bg-linear-to-br from-primary/20 to-primary/5
              flex items-center justify-center shrink-0
              group-hover:scale-110 transition-transform duration-300
            "
          >
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black text-text line-clamp-2 group-hover:text-primary ">
              {field.name}
            </h3>

            <span
              className={`
                inline-flex items-center 
                px-2.5 py-1 rounded-full 
                text-[10px] sm:text-xs font-bold uppercase tracking-wider
                ${
                  field.is_active
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-500/15 text-slate-700 dark:text-slate-400 border border-slate-500/20"
                }
              `}
            >
              <span
                className={`
                  w-1.5 h-1.5 rounded-full mr-1.5
                  ${field.is_active ? "bg-emerald-500" : "bg-slate-500"}
                `}
              />
              {field.is_active ? "Activa" : "Inactiva"}
            </span>
          </div>
        </div>

        {/* Location */}
        <div className="mb-5 min-h-12 flex-1">
          {field.location ? (
            <p className="text-sm sm:text-base text-text-muted line-clamp-2 leading-relaxed flex gap-2">
              <MapPin className="w-4 h-4 shrink-0 mt-1 opacity-50" />
              {field.location}
            </p>
          ) : (
            <p className="text-sm sm:text-base text-text-muted italic opacity-60">
              Sin ubicación registrada
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50 mt-auto">
          {field.location && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShowMap}
              className="flex-1 sm:flex-none gap-2 text-primary border-primary/20 hover:bg-primary/5"
            >
              <MapPin className="w-4 h-4" />
              <span>Mapa</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(field)}
            className="flex-1 sm:flex-none gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden xs:inline">Editar</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(field.field_id)}
            className="
              px-3 sm:px-4 ml-auto
              hover:scale-105 active:scale-95
              transition-transform duration-200
            "
            aria-label="Eliminar cancha"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
