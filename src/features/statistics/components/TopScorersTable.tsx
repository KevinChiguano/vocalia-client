import { BaseTable } from "@/components/ui/Table";
import { TopScorerStats } from "../types/statistics.types";
import { Trophy } from "lucide-react";

interface Props {
  data: TopScorerStats[];
}

export const TopScorersTable = ({ data }: Props) => {
  const columns = [
    { key: "rank", label: "#", width: "50px" },
    { key: "player", label: "Jugador" },
    { key: "team", label: "Equipo" },
    { key: "goals", label: "Goles", width: "100px" },
  ];

  return (
    <BaseTable
      columns={columns}
      data={data}
      renderRow={(scorer, index) => [
        <div className="flex justify-center">
          {index === 0 ? (
            <Trophy className="h-5 w-5 text-yellow-500" />
          ) : index === 1 ? (
            <Trophy className="h-5 w-5 text-gray-400" />
          ) : index === 2 ? (
            <Trophy className="h-5 w-5 text-amber-700" />
          ) : (
            <span className="font-medium text-text-muted">{index + 1}</span>
          )}
        </div>,
        <span className="font-bold text-primary">{scorer.player.name}</span>,
        <span>{scorer.team}</span>,
        <div className="text-center font-bold text-lg text-primary">
          {scorer.goals}
        </div>,
      ]}
      renderMobileRow={(scorer) => (
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-base">{scorer.player.name}</span>
            <span className="text-xs text-text-muted">{scorer.team}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-primary">
              {scorer.goals}
            </span>
            <span className="text-xs text-text-muted">Goles</span>
          </div>
        </div>
      )}
    />
  );
};
