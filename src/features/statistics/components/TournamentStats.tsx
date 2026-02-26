import { useState, useEffect, useMemo } from "react";
import { statisticsApi } from "../api/statistics.api";
import {
  TeamStats,
  TopScorerStats,
  PlayerStats,
} from "../types/statistics.types";
import { StandingsTable } from "./StandingsTable";
import { TopScorersTable } from "./TopScorersTable";
import { PlayersStatsTable } from "./PlayersStatsTable";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { PaginatedResponse } from "@/types/api.types";
import { Card } from "@/components/ui/Card";
import { CustomTabs } from "@/components/ui/CustomTabs";
import {
  TrendingUp,
  BarChart2,
  Activity,
  ShieldAlert,
  Target,
} from "lucide-react";

interface Props {
  tournamentId: number;
}

export const TournamentStats = ({ tournamentId }: Props) => {
  const [activeTab, setActiveTab] = useState("standings");
  const [loading, setLoading] = useState(false);

  // Data states
  const [standings, setStandings] = useState<TeamStats[]>([]);
  const [scorers, setScorers] = useState<TopScorerStats[]>([]);
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [playersMeta, setPlayersMeta] = useState<
    PaginatedResponse<PlayerStats>["meta"]
  >({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const [selectedPerformanceTeamId, setSelectedPerformanceTeamId] = useState<
    number | null
  >(null);

  // Fetch logic based on tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "standings") {
          const data = await statisticsApi.getStandings(tournamentId);
          setStandings(data);
          if (data.length > 0 && !selectedPerformanceTeamId) {
            setSelectedPerformanceTeamId(data[0].team.id);
          }
        } else if (activeTab === "scorers") {
          const data = await statisticsApi.getTopScorers(tournamentId, 20); // Top 20
          setScorers(data);
        } else if (activeTab === "players") {
          const res = await statisticsApi.getPlayersStats(
            tournamentId,
            playersMeta.page,
            playersMeta.limit,
          );
          setPlayers(res.data);
          setPlayersMeta(res.meta);
        }
      } catch (error) {
        console.error("Failed to fetch statistics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, activeTab, playersMeta.page]);

  // Fetch standings always initially to populate charts, if not on standings tab
  useEffect(() => {
    if (activeTab !== "standings" && standings.length === 0) {
      statisticsApi.getStandings(tournamentId).then((data) => {
        setStandings(data);
        if (data.length > 0 && !selectedPerformanceTeamId) {
          setSelectedPerformanceTeamId(data[0].team.id);
        }
      });
    }
  }, [tournamentId, activeTab]);

  const handlePageChange = (newPage: number) => {
    setPlayersMeta((prev) => ({ ...prev, page: newPage }));
  };

  const tabs = [
    { key: "standings", label: "Tabla de Posiciones" },
    { key: "scorers", label: "Goleadores" },
    { key: "players", label: "Estadísticas de Jugadores" },
  ];

  const selectedTeamPerformance = useMemo(
    () => standings.find((s) => s.team.id === selectedPerformanceTeamId),
    [standings, selectedPerformanceTeamId],
  );

  const avgStats = useMemo(() => {
    if (standings.length === 0) return null;
    return {
      yellow:
        standings.reduce((acc, curr) => acc + curr.yellowCards, 0) /
        standings.length,
      red:
        standings.reduce((acc, curr) => acc + curr.redCards, 0) /
        standings.length,
      gf:
        standings.reduce((acc, curr) => acc + curr.goalsFor, 0) /
        standings.length,
      gc:
        standings.reduce((acc, curr) => acc + curr.goalsAgainst, 0) /
        standings.length,
    };
  }, [standings]);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
          <CustomTabs
            tabs={tabs as any}
            activeTab={activeTab as any}
            onChange={setActiveTab as any}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="mt-2">
        {loading && activeTab === "standings" ? (
          <div className="flex justify-center p-8">
            <InlineSpinner size="lg" />
          </div>
        ) : activeTab === "standings" ? (
          <StandingsTable
            data={standings}
            selectedTeamId={selectedPerformanceTeamId}
            onRowClick={setSelectedPerformanceTeamId}
          />
        ) : null}

        {loading && activeTab === "scorers" ? (
          <div className="flex justify-center p-8">
            <InlineSpinner size="lg" />
          </div>
        ) : activeTab === "scorers" ? (
          <TopScorersTable data={scorers} />
        ) : null}

        {loading && activeTab === "players" ? (
          <div className="flex justify-center p-8">
            <InlineSpinner size="lg" />
          </div>
        ) : activeTab === "players" ? (
          <PlayersStatsTable
            data={players}
            meta={playersMeta}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>

      {/* Performance Charts Section */}
      {activeTab === "standings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {/* Discipline Chart */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldAlert className="size-5 text-primary" />
                Disciplina del Equipo
              </h3>
            </div>
            <div className="w-full flex-1 flex flex-col justify-center gap-6 mt-4 pb-2">
              {selectedTeamPerformance && avgStats ? (
                <div className="flex flex-col gap-6">
                  {/* Yellow Cards */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-4.5 bg-yellow-400 rounded-[2px] shadow-sm"></div>
                        <span className="font-semibold text-sm">Amarillas</span>
                      </div>
                      <span className="text-xl font-bold">
                        {selectedTeamPerformance.yellowCards}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted flex justify-between">
                      <span>Promedio Liga: {avgStats.yellow.toFixed(1)}</span>
                      <span
                        className={
                          selectedTeamPerformance.yellowCards > avgStats.yellow
                            ? "text-red-500 font-medium"
                            : "text-green-500 font-medium"
                        }
                      >
                        {selectedTeamPerformance.yellowCards > avgStats.yellow
                          ? "Peor al Promedio"
                          : "Mejor al Promedio"}
                      </span>
                    </div>
                  </div>

                  {/* Red Cards */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-4.5 bg-red-600 rounded-[2px] shadow-sm"></div>
                        <span className="font-semibold text-sm">Rojas</span>
                      </div>
                      <span className="text-xl font-bold">
                        {selectedTeamPerformance.redCards}
                      </span>
                    </div>
                    <div className="text-xs text-text-muted flex justify-between">
                      <span>Promedio Liga: {avgStats.red.toFixed(1)}</span>
                      <span
                        className={
                          selectedTeamPerformance.redCards > avgStats.red
                            ? "text-red-500 font-medium"
                            : "text-green-500 font-medium"
                        }
                      >
                        {selectedTeamPerformance.redCards > avgStats.red
                          ? "Peor al Promedio"
                          : "Mejor al Promedio"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
                  Seleccione un equipo de la tabla
                </div>
              )}
            </div>
          </Card>

          {/* Strength vs League Chart */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Fuerza vs. Liga
              </h3>
            </div>
            <div className="w-full flex-1 flex flex-col justify-center gap-6 mt-4 pb-2">
              {selectedTeamPerformance && avgStats ? (
                <div className="flex flex-col gap-6">
                  {/* Attack */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold">Nivel Ofensivo</span>
                      <span className="font-bold text-base">
                        {selectedTeamPerformance.goalsFor}{" "}
                        <span className="text-xs font-normal text-text-muted">
                          GF
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full bg-bg dark:bg-primary/10 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-primary rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (selectedTeamPerformance.goalsFor / (avgStats.gf * 2 || 1)) * 100)}%`,
                        }}
                      ></div>
                      {/* Average Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white border border-border shadow-sm z-10"
                        style={{
                          left: `${Math.min(100, (avgStats.gf / (avgStats.gf * 2 || 1)) * 100)}%`,
                        }}
                        title={`Promedio Liga: ${avgStats.gf.toFixed(1)} GF`}
                      ></div>
                    </div>
                    <span className="text-[10px] text-text-muted text-right">
                      Promedio: {avgStats.gf.toFixed(1)} GF
                    </span>
                  </div>

                  {/* Defense */}
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="font-semibold">Solidez Defensiva</span>
                      <span className="font-bold text-base">
                        {selectedTeamPerformance.goalsAgainst}{" "}
                        <span className="text-xs font-normal text-text-muted">
                          GC
                        </span>
                      </span>
                    </div>
                    <div className="relative h-2.5 w-full bg-bg dark:bg-primary/10 rounded-full overflow-hidden flex transform scale-x-[-1]">
                      {/* Note: inverted scale for defense (less is better visually) */}
                      <div
                        className="absolute h-full bg-[#af4b4b] rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.min(100, (selectedTeamPerformance.goalsAgainst / (avgStats.gc * 2 || 1)) * 100)}%`,
                        }}
                      ></div>
                      {/* Average Marker */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-white border border-border shadow-sm z-10"
                        style={{
                          left: `${Math.min(100, (avgStats.gc / (avgStats.gc * 2 || 1)) * 100)}%`,
                        }}
                        title={`Promedio Liga: ${avgStats.gc.toFixed(1)} GC`}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted">
                      <span>Mejor &larr;</span>
                      <span>Promedio: {avgStats.gc.toFixed(1)} GC</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
                  Seleccione un equipo de la tabla
                </div>
              )}
            </div>
          </Card>

          {/* Goals Bar Chart */}
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BarChart2 className="size-5 text-primary" />
                Goles: Marcados vs Recibidos
              </h3>
            </div>
            <div className="w-full flex flex-col justify-center flex-1 gap-6 mt-4 pb-2">
              {selectedTeamPerformance ? (
                (() => {
                  const teamStat = selectedTeamPerformance;
                  const totalGoals = teamStat.goalsFor + teamStat.goalsAgainst;
                  const gfPct =
                    totalGoals > 0
                      ? (teamStat.goalsFor / totalGoals) * 100
                      : 50;
                  const gcPct =
                    totalGoals > 0
                      ? (teamStat.goalsAgainst / totalGoals) * 100
                      : 50;

                  return (
                    <div key={teamStat.team.id} className="flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm mb-1">
                        <div className="flex items-center gap-2 font-semibold text-base">
                          {teamStat.team.logo && (
                            <img
                              src={teamStat.team.logo}
                              alt={teamStat.team.name}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <span>{teamStat.team.name}</span>
                        </div>
                        <span className="text-text-muted font-medium">
                          {teamStat.goalsFor} / {teamStat.goalsAgainst}
                        </span>
                      </div>
                      <div className="flex h-8 w-full rounded-full bg-bg dark:bg-primary/10 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-primary transition-all duration-1000 flex items-center justify-center text-xs font-bold text-white leading-none whitespace-nowrap overflow-hidden"
                          style={{ width: `${gfPct}%` }}
                          title={`Goles a Favor: ${teamStat.goalsFor}`}
                        >
                          {gfPct > 10 && `${gfPct.toFixed(0)}%`}
                        </div>
                        <div
                          className="h-full bg-[#af4b4b] transition-all duration-1000 flex items-center justify-center text-xs font-bold text-white leading-none whitespace-nowrap overflow-hidden"
                          style={{ width: `${gcPct}%` }}
                          title={`Goles en Contra: ${teamStat.goalsAgainst}`}
                        >
                          {gcPct > 10 && `${gcPct.toFixed(0)}%`}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-text-muted">
                  Seleccione un equipo de la tabla
                </div>
              )}

              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium text-text-muted">
                    Goles Favor
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded-full bg-[#af4b4b]"></div>
                  <span className="text-sm font-medium text-text-muted">
                    Goles Contra
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Rendimiento Chart Section (Replaces Radar) */}
          <Card className="p-6 flex flex-col gap-6 lg:col-span-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                Rendimiento de {selectedTeamPerformance?.team.name ?? "Equipo"}
              </h3>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12 mt-4">
              <div className="relative flex-1 flex flex-col items-center justify-center w-full min-h-[200px]">
                {selectedTeamPerformance ? (
                  (() => {
                    const sp = selectedTeamPerformance;
                    const totalPlayed = sp.played || 1; // avoid / 0
                    const wonPct = (sp.won / totalPlayed) * 100;
                    const drawnPct = (sp.drawn / totalPlayed) * 100;
                    const lostPct = (sp.lost / totalPlayed) * 100;

                    return (
                      <div className="w-full max-w-md flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-green-600 dark:text-green-400">
                              Ganados ({sp.won})
                            </span>
                            <span>{wonPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-4 w-full bg-bg dark:bg-primary/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 transition-all duration-1000"
                              style={{ width: `${wonPct}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-yellow-600 dark:text-yellow-400">
                              Empatados ({sp.drawn})
                            </span>
                            <span>{drawnPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-4 w-full bg-bg dark:bg-primary/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 transition-all duration-1000"
                              style={{ width: `${drawnPct}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between text-sm font-semibold">
                            <span className="text-red-600 dark:text-red-400">
                              Perdidos ({sp.lost})
                            </span>
                            <span>{lostPct.toFixed(1)}%</span>
                          </div>
                          <div className="h-4 w-full bg-bg dark:bg-primary/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 transition-all duration-1000"
                              style={{ width: `${lostPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-text-muted">
                    Seleccione un equipo con datos
                  </div>
                )}
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-primary uppercase font-bold mb-1">
                    Partidos Jugados
                  </p>
                  <p className="text-3xl font-black">
                    {selectedTeamPerformance?.played ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-primary uppercase font-bold mb-1">
                    Puntos Totales
                  </p>
                  <p className="text-3xl font-black">
                    {selectedTeamPerformance?.points ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-primary uppercase font-bold mb-1">
                    Diferencia de Gol
                  </p>
                  <p
                    className={`text-3xl font-black ${(selectedTeamPerformance?.goalDiff ?? 0) > 0 ? "text-green-500" : (selectedTeamPerformance?.goalDiff ?? 0) < 0 ? "text-red-500" : ""}`}
                  >
                    {(selectedTeamPerformance?.goalDiff ?? 0) > 0 ? "+" : ""}
                    {selectedTeamPerformance?.goalDiff ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/5 flex flex-col items-center justify-center text-center">
                  <p className="text-xs text-primary uppercase font-bold mb-1">
                    Efectividad
                  </p>
                  <p className="text-3xl font-black">
                    {selectedTeamPerformance?.played
                      ? (
                          (selectedTeamPerformance.points /
                            (selectedTeamPerformance.played * 3)) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};
