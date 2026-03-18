import {
  Edit2,
  Trash2,
  CalendarDays,
  CalendarX,
  Trophy,
  Users,
} from "lucide-react";
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
      shadow-sm overflow-hidden
      hover:-translate-y-1 hover:shadow-md transition-all
      flex flex-col h-full"
    >
      {/* Header con icono */}
      <div
        className={cn(
          "relative h-32 sm:h-40 overflow-hidden",
          tournament.isActive
            ? "tournament-gradient"
            : "bg-linear-to-br from-gray-300 to-gray-500",
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-full h-full",
            tournament.isActive ? "text-white/95" : "text-white/70",
          )}
        >
          <Trophy className="w-12 h-12 sm:w-16 sm:h-16 relative z-10" />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-black/10 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Header con título y estado */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-text line-clamp-2 leading-tight">
            {tournament.name}
          </h3>
          {/* Estado Badge */}
          <div className="flex items-center">
            <span
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
                tournament.isActive
                  ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400"
                  : "bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full mr-1.5",
                  tournament.isActive ? "bg-green-500" : "bg-gray-500",
                )}
              />
              {tournament.isActive ? "Activo" : "Finalizado"}
            </span>
          </div>
        </div>

        {/* Fechas */}
        <div className="space-y-3 text-sm text-text-muted mt-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 shrink-0" />
            <span>
              Inicio:{" "}
              {tournament.startDate
                ? formatDateForDisplay(tournament.startDate)
                : "???"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarX className="w-4 h-4 shrink-0" />
            <span>
              Fin:{" "}
              {tournament.endDate
                ? formatDateForDisplay(tournament.endDate)
                : "???"}
            </span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 pt-4 mt-auto border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(tournament)}
            className="flex-1 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onManageTeams(tournament)}
            className="flex-1 gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Equipos</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(tournament.id)}
            className="px-3 md:px-4"
            aria-label="Eliminar torneo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
