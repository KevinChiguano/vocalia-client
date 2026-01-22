import { BaseTable } from "@/components/ui/Table";
import { TeamStats } from "../types/statistics.types";
import { Badge } from "@/components/ui/Badge";

interface Props {
  data: TeamStats[];
}

export const StandingsTable = ({ data }: Props) => {
  const columns = [
    { key: "rank", label: "#", width: "50px" },
    { key: "team", label: "Equipo" },
    { key: "played", label: "PJ", width: "60px" },
    { key: "won", label: "G", width: "60px" },
    { key: "drawn", label: "E", width: "60px" },
    { key: "lost", label: "P", width: "60px" },
    { key: "goalsFor", label: "GF", width: "60px" },
    { key: "goalsAgainst", label: "GC", width: "60px" },
    { key: "goalDiff", label: "DG", width: "80px" },
    { key: "points", label: "Pts", width: "60px" },
  ];

  return (
    <BaseTable
      columns={columns}
      data={data}
      renderRow={(team, index) => [
        <span className="font-medium">{index + 1}</span>,
        <span className="font-medium text-primary">{team.team.name}</span>,
        <div className="text-center">{team.played}</div>,
        <div className="text-center">{team.won}</div>,
        <div className="text-center">{team.drawn}</div>,
        <div className="text-center">{team.lost}</div>,
        <div className="text-center">{team.goalsFor}</div>,
        <div className="text-center">{team.goalsAgainst}</div>,
        <div className="text-center">
          <Badge
            variant="outline"
            className={
              team.goalDiff > 0
                ? "text-success border-success bg-success/5"
                : team.goalDiff < 0
                  ? "text-danger border-danger bg-danger/5"
                  : "text-text-muted border-border"
            }
          >
            {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
          </Badge>
        </div>,
        <div className="text-center font-bold text-lg">{team.points}</div>,
      ]}
      renderMobileRow={(team) => (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{team.team.name}</span>
            <span className="text-sm text-text-muted">
              {team.played} PJ | {team.points} Pts
            </span>
          </div>
          <Badge variant="outline" className="text-lg font-bold">
            #{data.indexOf(team) + 1}
          </Badge>
        </div>
      )}
    />
  );
};
