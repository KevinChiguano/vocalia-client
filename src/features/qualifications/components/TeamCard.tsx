import { Edit2, Trash2, Shield, Tag, Users } from "lucide-react";
import { Team } from "../types/team.types";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

interface Props {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: number) => void;
}

export const TeamCard = ({ team, onEdit, onDelete }: Props) => {
  const navigate = useNavigate();
  return (
    <div
      className="group relative bg-surface border border-border rounded-2xl 
      shadow-soft overflow-hidden hover:-translate-y-1 hover:shadow-xl 
      hover:border-primary/40 flex flex-col h-full"
    >
      {/* Team Logo Section */}
      <div className="relative h-44 flex items-center justify-center bg-elevated/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="w-32 h-32 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center text-text-muted group-hover:border-primary/50">
            <Shield className="w-12 h-12 opacity-30" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border ${
              team.isActive
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-red-500/10 text-red-600 border-red-500/20"
            }`}
          >
            {team.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="space-y-1.5">
          <h3 className="text-lg sm:text-xl font-black text-text line-clamp-2 group-hover:text-primary">
            {team.name}
          </h3>

          {team.category && (
            <div className="flex items-center gap-1.5 text-text-muted">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wide">
                {team.category.name}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 mt-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(team)}
            className="flex-1 gap-2 rounded-xl"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(team.id)}
            className="px-3 rounded-xl"
            aria-label="Eliminar equipo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          variant="secondary"
          className="w-full gap-2 mt-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
          onClick={() => {
            const params = new URLSearchParams();
            params.set("teamId", team.id.toString());
            if (team.categoryId) {
              params.set("categoryId", team.categoryId.toString());
            }
            navigate(`?${params.toString()}`);
          }}
        >
          <Users className="w-4 h-4" />
          <span>Ver Jugadores</span>
        </Button>
      </div>
    </div>
  );
};
