import { Edit2, Trash2, Calendar, Trophy, List } from "lucide-react";
import { Link } from "react-router-dom";
import { League } from "../types/league.types";
import { Button } from "@/components/ui/Button";
import { formatTimestampForDisplay } from "@/utils/dateUtils";

interface Props {
  league: League;
  onEdit: (league: League) => void;
  onDelete: (id: number) => void;
}

export const LeagueCard = ({ league, onEdit, onDelete }: Props) => {
  return (
    <div
      className="group relative bg-surface border border-border rounded-xl
      shadow-soft overflow-hidden
      hover:-translate-y-1 hover:shadow-xl hover:border-primary/30
      flex flex-col h-full"
    >
      {/* Imagen Header */}
      <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100">
        {league.imageUrl ? (
          <img
            src={league.imageUrl}
            alt={league.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Header con título y estado */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-text line-clamp-2 group-hover:text-primary">
            {league.name}
          </h3>

          {/* Estado Badge - Ahora fuera de la imagen */}
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                league.isActive
                  ? "bg-green-500/10 text-green-600  dark:bg-green-500/20 dark:text-green-400 dark:border-green-800"
                  : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 dark:border-red-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  league.isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {league.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {/* Fecha de creación */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-text-muted pt-2 border-t border-border">
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <p>Creado el</p>
          <span className="truncate">
            {formatTimestampForDisplay(league.createdAt)}
          </span>
        </div>

        {/* Acciones - Mantener al final con mt-auto */}
        <div className="flex gap-2 pt-3 mt-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(league)}
            className="flex-1 gap-1.5 sm:gap-2 text-xs sm:text-sm rounded-xl"
          >
            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Editar</span>
          </Button>

          <Link
            to={`/administration/leagues/${league.id}/tournaments`}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium"
            title="Gestionar Torneos"
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-xl" />
          </Link>

          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(league.id)}
            className="px-2.5 sm:px-3 rounded-xl"
            aria-label="Eliminar liga"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
