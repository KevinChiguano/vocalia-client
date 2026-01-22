import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"; // Assuming standard UI tabs
import { statisticsApi } from "../api/statistics.api";
import {
  TeamStats,
  TopScorerStats,
  PlayerStats,
} from "../types/statistics.types";
import { StandingsTable } from "./StandingsTable";
import { TopScorersTable } from "./TopScorersTable";
import { PlayersStatsTable } from "./PlayersStatsTable";
import { InlineSpinner } from "@/components/ui/InlineSpinner"; // Assuming InlineSpinner exists
import { PaginatedResponse } from "@/types/api.types";

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

  // Fetch logic based on tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "standings") {
          const data = await statisticsApi.getStandings(tournamentId);
          setStandings(data);
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

  const handlePageChange = (newPage: number) => {
    setPlayersMeta((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="standings"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="standings">Tabla de Posiciones</TabsTrigger>
          <TabsTrigger value="scorers">Goleadores</TabsTrigger>
          <TabsTrigger value="players">Estadísticas de Jugadores</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {loading ? (
            <div className="flex justify-center p-8">
              <InlineSpinner size="lg" />
            </div>
          ) : (
            <>
              <TabsContent value="standings">
                <StandingsTable data={standings} />
              </TabsContent>
              <TabsContent value="scorers">
                <TopScorersTable data={scorers} />
              </TabsContent>
              <TabsContent value="players">
                <PlayersStatsTable
                  data={players}
                  meta={playersMeta}
                  onPageChange={handlePageChange}
                />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
};
