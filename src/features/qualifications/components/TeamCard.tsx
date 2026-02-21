import { Edit2, Shield, Trash2, ClipboardList, Users } from "lucide-react";
import { Team } from "../types/team.types";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import clsx from "clsx";

interface Props {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (id: number) => void;
}

export const TeamCard = ({ team, onEdit, onDelete }: Props) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-surface border border-border rounded-2xl shadow-soft flex flex-col h-full overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 transition-all">
      <div className="relative h-44 flex items-center justify-center bg-elevated/50 p-6 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-50" />
        {team.logo ? (
          <img
            src={team.logo}
            alt={team.name}
            className="w-32 h-32 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center text-text-muted group-hover:border-primary/50 transition-colors">
            <Shield className="w-12 h-12 opacity-30" />
          </div>
        )}

        <div className="absolute top-3 right-3">
          <Badge
            variant={team.isActive ? "success" : "neutral"}
            size="sm"
            className="shadow-sm font-semibold uppercase"
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full mr-1.5",
                team.isActive ? "bg-success" : "bg-gray-500",
              )}
            />
            {team.isActive ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-black mb-1 line-clamp-2 group-hover:text-primary transition-colors text-text">
          {team.name}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          {team.category && (
            <>
              <Badge
                variant="primary"
                size="sm"
                className="uppercase bg-primary/10 text-primary border-none shadow-none text-xs px-2 py-0.5"
              >
                {team.category.name}
              </Badge>
              <span className="text-text-muted text-xs">•</span>
            </>
          )}
          <span className="flex items-center gap-1 text-text-muted text-sm font-medium">
            <Users className="w-4 h-4" />
            {(team as any)._count?.players || 0} Inscritos
          </span>
        </div>

        <div className="flex gap-2 pt-4 mt-auto border-t border-border/50">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(team)}
            className="flex-1 gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Editar</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(team.id)}
            className="px-3 md:px-4"
            aria-label="Eliminar equipo"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={() => {
            const params = new URLSearchParams();
            params.set("teamId", team.id.toString());
            if (team.categoryId) {
              params.set("categoryId", team.categoryId.toString());
            }
            navigate(`?${params.toString()}`);
          }}
          className="w-full mt-3 flex items-center justify-center gap-2"
        >
          <ClipboardList className="w-5 h-5" />
          Ver Nómina
        </Button>
      </div>
    </div>
  );
};
