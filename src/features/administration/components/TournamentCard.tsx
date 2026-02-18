import { Edit2, Trash2, Calendar, Trophy, Users } from "lucide-react";
import { Tournament } from "../types/tournament.types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { formatDateForDisplay } from "@/utils/dateUtils";

interface Props {
  tournament: Tournament;
  onEdit: (tournament: Tournament) => void;
  onDelete: (id: number) => void;
  onManageTeams: (tournament: Tournament) => void;
}

export const TournamentCard = ({
  tournament,
  onEdit,
  onDelete,
  onManageTeams,
}: Props) => {
  return (
    <div
      className="group relative bg-surface border border-border rounded-xl
      shadow-soft overflow-hidden
      hover:-translate-y-1 hover:shadow-xl hover:border-primary/30
      flex flex-col h-full"
    >
      {/* Header con icono */}
      <div className="relative h-40 sm:h-48 overflow-hidden tournament-gradient">
        <div className="flex items-center justify-center w-full h-full text-white/95">
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header con título y estado */}
        <div className="space-y-2">
          {/* <h3 className="text-lg sm:text-xl font-bold text-text line-clamp-2 min-h-[3.5rem] sm:min-h-[3rem]"> */}
          <h3 className="text-lg sm:text-xl font-black text-text line-clamp-2 group-hover:text-primary">
            {tournament.name}
          </h3>
          {/* Estado Badge */}
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                tournament.isActive
                  ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 dark:border-green-800"
                  : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  tournament.isActive ? "bg-green-500" : "bg-red-500",
                )}
              />
              {tournament.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Fechas */}
        {(tournament.startDate || tournament.endDate) && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted pt-2 border-t border-border">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
            <p>Inicio: </p>
            <span className="truncate">
              {formatDateForDisplay(tournament.startDate)}
            </span>
            <span>-</span>
            <p>Fin:</p>
            <span className="truncate">
              {formatDateForDisplay(tournament.endDate)}
            </span>
          </div>
        )}

        {/* Acciones - Mantener al final con mt-auto */}
        <div className="flex gap-2 pt-3 mt-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(tournament)}
            className="flex-1 gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-xl"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Editar</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageTeams(tournament)}
            className="flex-1 gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-xl border border-primary text-primary hover:bg-primary/5"
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Equipos</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(tournament.id)}
            className="px-2.5 sm:px-3 rounded-xl"
            aria-label="Eliminar torneo"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
