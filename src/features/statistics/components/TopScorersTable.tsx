import { BaseTable } from "@/components/ui/Table";
import { TopScorerStats } from "../types/statistics.types";
import { Trophy } from "lucide-react";
import { getDirectImageUrl } from "@/utils/imageUtils";

interface Props {
  data: TopScorerStats[];
}

const PodiumItem = ({
  scorer,
  position,
}: {
  scorer: TopScorerStats;
  position: number;
}) => {
  const isFirst = position === 1;
  const isSecond = position === 2;
  const isThird = position === 3;

  const sizeClass = isFirst ? "size-24 sm:size-32" : "size-20 sm:size-24";

  let borderColor = "border-slate-300";
  let badgeColor = "bg-slate-300 text-slate-800";

  if (isFirst) {
    borderColor = "border-yellow-500 shadow-yellow-500/20";
    badgeColor = "bg-yellow-500 text-yellow-950";
  } else if (isSecond) {
    borderColor = "border-slate-400 dark:border-slate-500 shadow-slate-400/20";
    badgeColor =
      "bg-slate-300 dark:bg-slate-500 text-slate-800 dark:text-slate-100";
  } else if (isThird) {
    borderColor = "border-amber-700 shadow-amber-700/20";
    badgeColor = "bg-amber-700 text-amber-50";
  }

  const initials = scorer.player.name.substring(0, 2).toUpperCase();

  return (
    <div
      className={`flex flex-col items-center ${isFirst ? "-mt-8 sm:-mt-12 z-10" : "z-0"}`}
    >
      <div className="relative mb-3 flex flex-col items-center">
        <div
          className={`${sizeClass} rounded-full border-4 ${borderColor} bg-surface p-1 flex items-center justify-center shadow-xl transition-transform hover:scale-105`}
        >
          <div className="w-full h-full bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
            {scorer.player.image ? (
              <img
                src={getDirectImageUrl(scorer.player.image)}
                alt={scorer.player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className={`font-bold text-text ${isFirst ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"}`}
              >
                {initials}
              </span>
            )}
          </div>
        </div>
        <div
          className={`absolute bottom-0 right-0 sm:right-2 size-7 sm:size-8 rounded-full ${badgeColor} flex items-center justify-center font-black text-sm shadow-md border-2 border-surface`}
        >
          {position}
        </div>
      </div>
      <div className="text-center flex flex-col items-center">
        <p
          className="font-bold text-text text-sm sm:text-base truncate max-w-[100px] sm:max-w-[140px]"
          title={scorer.player.name}
        >
          {scorer.player.name}
        </p>
        <p className="font-black text-primary text-lg sm:text-xl leading-none mt-1">
          {scorer.goals}
        </p>
        <p className="text-[10px] text-text-muted font-bold tracking-widest uppercase mt-0.5">
          Goles
        </p>
      </div>
    </div>
  );
};

export const TopScorersTable = ({ data }: Props) => {
  const columns = [
    { key: "rank", label: "#", width: "50px" },
    { key: "player", label: "JUGADOR" },
    { key: "team", label: "EQUIPO" },
    { key: "goals", label: "GOLES", width: "100px" },
  ];

  return (
    <div className="space-y-8">
      {data.length >= 3 && (
        <div className="flex flex-col items-center pt-8 pb-4">
          <h3 className="text-xl sm:text-2xl font-black mb-12 sm:mb-16 text-text">
            Podio de Goleadores
          </h3>
          <div className="flex items-end justify-center gap-4 sm:gap-12">
            {/* 2nd Place */}
            <PodiumItem scorer={data[1]} position={2} />
            {/* 1st Place */}
            <PodiumItem scorer={data[0]} position={1} />
            {/* 3rd Place */}
            <PodiumItem scorer={data[2]} position={3} />
          </div>
        </div>
      )}

      <BaseTable
        columns={columns}
        data={data}
        renderRow={(scorer, index) => [
          <div className="flex justify-center" key={`col-rank-${index}`}>
            {index === 0 ? (
              <Trophy className="h-5 w-5 text-yellow-500" />
            ) : index === 1 ? (
              <Trophy className="h-5 w-5 text-slate-400" />
            ) : index === 2 ? (
              <Trophy className="h-5 w-5 text-amber-700" />
            ) : (
              <span className="font-medium text-text-muted">{index + 1}</span>
            )}
          </div>,
          <div className="flex items-center gap-3" key={`col-player-${index}`}>
            {scorer.player.image ? (
              <img
                src={getDirectImageUrl(scorer.player.image)}
                alt={scorer.player.name}
                className="w-8 h-8 rounded-full object-cover bg-surface border border-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {scorer.player.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-text">{scorer.player.name}</span>
          </div>,
          <div
            className="flex items-center gap-2 text-text-muted"
            key={`col-team-${index}`}
          >
            {scorer.team.logo && (
              <img
                src={getDirectImageUrl(scorer.team.logo)}
                className="w-5 h-5 object-contain"
                alt={scorer.team.name}
              />
            )}
            <span>{scorer.team.name}</span>
          </div>,
          <div
            className="text-center font-bold text-lg text-primary"
            key={`col-goals-${index}`}
          >
            {scorer.goals}
          </div>,
        ]}
        renderMobileRow={(scorer) => (
          <div
            className="flex items-center justify-between"
            key={scorer.player.id}
          >
            <div className="flex items-center gap-3">
              {scorer.player.image ? (
                <img
                  src={getDirectImageUrl(scorer.player.image)}
                  alt={scorer.player.name}
                  className="w-10 h-10 rounded-full object-cover bg-surface border border-border shrink-0"
                />
              ) : (
                <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {scorer.player.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-bold text-base text-text">
                  {scorer.player.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-text-muted">
                  {scorer.team.logo && (
                    <img
                      src={getDirectImageUrl(scorer.team.logo)}
                      className="w-3.5 h-3.5 object-contain"
                      alt={scorer.team.name}
                    />
                  )}
                  <span className="text-xs">{scorer.team.name}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-primary">
                {scorer.goals}
              </span>
              <span className="text-xs text-text-muted uppercase">Goles</span>
            </div>
          </div>
        )}
      />
    </div>
  );
};
