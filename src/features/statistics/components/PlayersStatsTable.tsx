import { BaseTable } from "@/components/ui/Table";
import { PlayerStats } from "../types/statistics.types";
import { PaginationFooter } from "@/components/ui/PaginationFooter";
import { PaginatedResponse } from "@/types/api.types";
import { Badge } from "@/components/ui/Badge";

interface Props {
  data: PlayerStats[];
  meta: PaginatedResponse<PlayerStats>["meta"];
  onPageChange: (page: number) => void;
}

export const PlayersStatsTable = ({ data, meta, onPageChange }: Props) => {
  const columns = [
    { key: "player", label: "Jugador" },
    { key: "team", label: "Equipo" },
    { key: "matches", label: "PJ", width: "60px" },
    { key: "goals", label: "Goles", width: "80px" },
    { key: "yellowCards", label: "TA", width: "60px" },
    { key: "redCards", label: "TR", width: "60px" },
  ];

  return (
    <div className="space-y-4">
      <BaseTable
        columns={columns}
        data={data}
        renderRow={(stat) => [
          <div className="flex flex-col">
            <span className="font-medium">{stat.player.name}</span>
            <span className="text-xs text-muted-foreground">
              #{stat.player.number}
            </span>
          </div>,
          <span className="text-sm">{stat.team.name}</span>,
          <div className="text-center">{stat.matchesPlayed}</div>,
          <div className="text-center font-bold">{stat.goals}</div>,
          <div className="text-center text-yellow-600">
            <Badge variant="warning">{stat.yellowCards}</Badge>
          </div>,
          <div className="text-center text-red-600">
            <Badge variant="danger">{stat.redCards}</Badge>
          </div>,
        ]}
        renderMobileRow={(stat) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-bold text-sm">{stat.player.name}</span>
                <span className="text-xs text-text-muted">
                  {stat.team.name}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-yellow-600">TA</span>
                <span className="text-sm">{stat.yellowCards}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-red-600">TR</span>
                <span className="text-sm">{stat.redCards}</span>
              </div>
              <div className="flex flex-col items-center pl-2 border-l border-border">
                <span className="text-xs font-bold text-primary">Gol</span>
                <span className="text-sm font-bold text-primary">
                  {stat.goals}
                </span>
              </div>
            </div>
          </div>
        )}
      />

      {meta && (
        <PaginationFooter
          currentCount={data.length}
          totalCount={meta.total}
          itemName="registros"
          page={meta.page}
          totalPages={meta.totalPages}
          onChange={onPageChange}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-6 border-t border-border/50"
        />
      )}
    </div>
  );
};
