import { BaseTable } from "@/components/ui/Table";
import { PlayerStats } from "../types/statistics.types";
import { PaginationFooter } from "@/components/ui/PaginationFooter";
import { PaginatedResponse } from "@/types/api.types";

interface Props {
  data: PlayerStats[];
  meta: PaginatedResponse<PlayerStats>["meta"];
  onPageChange: (page: number) => void;
}

export const PlayersStatsTable = ({ data, meta, onPageChange }: Props) => {
  const columns = [
    { key: "player", label: "JUGADOR", width: "40%" },
    { key: "team", label: "EQUIPO", width: "25%" },
    { key: "matches", label: "PJ", width: "60px" },
    {
      key: "goals",
      label: "GOLES",
      width: "80px",
    },
    { key: "yellowCards", label: "TA", width: "60px" },
    { key: "redCards", label: "TR", width: "60px" },
  ];

  return (
    <div className="space-y-4">
      <BaseTable
        columns={columns}
        data={data}
        renderRow={(stat) => [
          <div className="flex items-center gap-3">
            {stat.player.image ? (
              <img
                src={stat.player.image}
                alt={stat.player.name}
                className="w-10 h-10 rounded-full object-cover bg-surface border border-border shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                {stat.player.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-base text-text">
                {stat.player.name}
              </span>
              <span className="text-xs text-text-muted">
                Dorsal #{stat.player.number}
              </span>
            </div>
          </div>,
          <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
            {stat.team.logo ? (
              <img
                src={stat.team.logo}
                className="w-6 h-6 object-contain bg-white rounded-full p-0.5"
                alt={stat.team.name}
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center" />
            )}
            <span>{stat.team.name}</span>
          </div>,
          <div className="text-left font-bold text-text-muted">
            {stat.matchesPlayed}
          </div>,
          <div className="text-left ml-4 font-black text-primary">
            {stat.goals}
          </div>,
          <div className="flex items-center justify-start gap-1.5">
            <div className="w-3.5 h-4.5 bg-yellow-400 rounded-[2px] shadow-sm"></div>
            <span className="font-bold text-text-muted">
              {stat.yellowCards}
            </span>
          </div>,
          <div className="flex items-center justify-start gap-1.5">
            <div className="w-3.5 h-4.5 bg-red-600 rounded-[2px] shadow-sm"></div>
            <span className="font-bold text-text-muted">{stat.redCards}</span>
          </div>,
        ]}
        renderMobileRow={(stat) => (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {stat.player.image ? (
                <img
                  src={stat.player.image}
                  alt={stat.player.name}
                  className="w-10 h-10 rounded-full object-cover bg-surface border border-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {stat.player.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-sm">{stat.player.name}</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-text-muted">
                  {stat.team.logo ? (
                    <img
                      src={stat.team.logo}
                      className="w-3.5 h-3.5 object-contain bg-white rounded-full p-px"
                      alt={stat.team.name}
                    />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full bg-white border border-border" />
                  )}
                  <span className="text-xs">{stat.team.name}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex flex-col items-center justify-center">
                <div className="w-3 h-4 bg-yellow-400 rounded-[2px] shadow-sm mb-0.5"></div>
                <span className="text-xs font-bold text-text-muted">
                  {stat.yellowCards}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <div className="w-3 h-4 bg-red-600 rounded-[2px] shadow-sm mb-0.5"></div>
                <span className="text-xs font-bold text-text-muted">
                  {stat.redCards}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center pl-2.5 border-l border-border/50">
                <span className="text-[10px] font-bold text-primary tracking-widest leading-none">
                  GOL
                </span>
                <span className="text-base font-black text-primary leading-none mt-1">
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
