import { useState, useEffect } from "react";
import { StatisticsDashboard } from "../components/StatisticsDashboard";
import { TournamentStats } from "../components/TournamentStats";
import { statisticsApi } from "../api/statistics.api";
import { tournamentApi } from "@/features/administration/api/tournament.api";
import { GlobalDashboardStats } from "../types/statistics.types";
import { Tournament } from "@/features/administration/types/tournament.types";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { PageHeader } from "@/components/ui/PageHeader";
import { Select } from "@/components/ui/Select";

const StatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState<GlobalDashboardStats | null>(
    null,
  );
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState<
    number | null
  >(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [statsData, tournamentsData] = await Promise.all([
          statisticsApi.getGlobalDashboard(),
          tournamentApi.getTournaments({ page: 1, limit: 100 }), // Get all active tournaments ideally
        ]);

        setGlobalStats(statsData);
        setTournaments(tournamentsData.data); // data.data is the array based on my api wrapper
        if (tournamentsData.data.length > 0) {
          setSelectedTournamentId(tournamentsData.data[0].id);
        }
      } catch (error) {
        console.error("Error loading statistics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleTournamentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTournamentId(Number(e.target.value));
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Estadísticas del <span className="text-primary">Sistema</span>
          </>
        }
        description="Resumen global y por torneo del desempeño deportivo en tiempo real."
        actions={
          <div className="w-full md:w-72">
            <Select
              label="Seleccionar Torneo"
              value={selectedTournamentId ?? ""}
              onChange={handleTournamentChange}
            >
              <option value="" disabled>
                Seleccione un torneo
              </option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        }
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <InlineSpinner size="lg" />
        </div>
      ) : (
        <>
          {globalStats && <StatisticsDashboard stats={globalStats} />}

          <div className="space-y-4">
            {selectedTournamentId && (
              <TournamentStats tournamentId={selectedTournamentId} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
