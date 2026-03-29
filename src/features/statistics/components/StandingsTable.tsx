import { TeamStats } from "../types/statistics.types";
import { getDirectImageUrl } from "@/utils/imageUtils";

interface Props {
  data: TeamStats[];
  selectedTeamId?: number | null;
  onRowClick?: (teamId: number) => void;
}

export const StandingsTable = ({ data, selectedTeamId, onRowClick }: Props) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface rounded-xl border border-border p-8 text-center text-text-muted">
        No hay datos de posiciones disponibles.
      </div>
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="ui-table-head">
              <tr>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider w-16 text-center">
                  Pos
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider">
                  Equipo
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  PJ
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  G
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  E
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  P
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  GF
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  GC
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center">
                  DG
                </th>
                <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-center bg-primary/20">
                  Pts
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {data.map((team, index) => {
                const pos = index + 1;
                const isFirst = pos === 1;
                const isSecond = pos === 2;
                const isThird = pos === 3;

                let posColor = "font-bold text-text-muted";
                if (isFirst) posColor = "font-bold text-primary";
                if (isSecond) posColor = "font-bold text-primary/80";
                if (isThird) posColor = "font-bold text-primary/70";

                const isSelected = team.team.id === selectedTeamId;

                return (
                  <tr
                    key={team.team.id}
                    onClick={() => onRowClick && onRowClick(team.team.id)}
                    className={`hover:bg-primary/5 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : ""
                    }`}
                  >
                    <td className={`px-4 py-4 text-center ${posColor}`}>
                      {pos}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full flex shrink-0 items-center justify-center font-bold text-xs text-text uppercase overflow-hidden">
                          {team.team.logo ? (
                            <img
                              src={getDirectImageUrl(team.team.logo)}
                              alt={team.team.name}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            team.team.name.substring(0, 2)
                          )}
                        </div>
                        <span className="font-semibold">{team.team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">{team.played}</td>
                    <td className="px-4 py-4 text-center">{team.won}</td>
                    <td className="px-4 py-4 text-center">{team.drawn}</td>
                    <td className="px-4 py-4 text-center">{team.lost}</td>
                    <td className="px-4 py-4 text-center">{team.goalsFor}</td>
                    <td className="px-4 py-4 text-center">
                      {team.goalsAgainst}
                    </td>
                    <td
                      className={`px-4 py-4 text-center font-medium ${
                        team.goalDiff > 0
                          ? "text-green-500"
                          : team.goalDiff < 0
                            ? "text-red-500"
                            : "text-text-muted"
                      }`}
                    >
                      {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                    </td>
                    <td className="px-4 py-4 text-center font-black bg-primary/5">
                      {team.points}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((team, index) => {
          const pos = index + 1;
          const isFirst = pos === 1;
          const isSecond = pos === 2;
          const isThird = pos === 3;

          let posColor = "bg-surface border-border text-text-muted";
          if (isFirst)
            posColor = "bg-primary text-white border-primary shadow-sm";
          else if (isSecond)
            posColor = "bg-primary/80 text-white border-primary/80";
          else if (isThird)
            posColor = "bg-primary/60 text-white border-primary/60";

          const isSelected = team.team.id === selectedTeamId;

          return (
            <div
              key={team.team.id}
              onClick={() => onRowClick && onRowClick(team.team.id)}
              className={`bg-surface rounded-xl border p-4 flex flex-col gap-4 cursor-pointer transition-colors shadow-sm ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-primary/5"
              }`}
            >
              {/* Header: Pos, Team, Points */}
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-8 rounded-full flex shrink-0 items-center justify-center font-bold text-sm border ${posColor}`}
                  >
                    {pos}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full flex shrink-0 items-center justify-center font-bold text-xs text-text uppercase overflow-hidden">
                      {team.team.logo ? (
                        <img
                          src={getDirectImageUrl(team.team.logo)}
                          alt={team.team.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        team.team.name.substring(0, 2)
                      )}
                    </div>
                    <span className="font-bold text-base truncate max-w-[140px] sm:max-w-[200px]">
                      {team.team.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    PTS
                  </span>
                  <span className="text-xl font-black text-primary leading-none">
                    {team.points}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-y-3 gap-x-2">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    PJ
                  </span>
                  <span className="font-semibold text-sm">{team.played}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    G
                  </span>
                  <span className="font-semibold text-sm">{team.won}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    E
                  </span>
                  <span className="font-semibold text-sm">{team.drawn}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    P
                  </span>
                  <span className="font-semibold text-sm">{team.lost}</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    GF
                  </span>
                  <span className="font-semibold text-sm">{team.goalsFor}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    GC
                  </span>
                  <span className="font-semibold text-sm">
                    {team.goalsAgainst}
                  </span>
                </div>
                <div className="flex flex-col items-center col-span-2">
                  <span className="text-[10px] text-text-muted uppercase font-bold">
                    Diferencia de Gol
                  </span>
                  <span
                    className={`font-bold text-sm ${
                      team.goalDiff > 0
                        ? "text-green-500"
                        : team.goalDiff < 0
                          ? "text-red-500"
                          : "text-text-muted"
                    }`}
                  >
                    {team.goalDiff > 0 ? `+${team.goalDiff}` : team.goalDiff}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
