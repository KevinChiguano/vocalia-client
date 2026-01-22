import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useMatchVocalia, useVocaliasMutations } from "../hooks/useVocalias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MatchHeader } from "../components/MatchHeader";
import { MatchPlayersTab } from "../components/MatchPlayersTab";
import { MatchEventsTab } from "../components/MatchEventsTab";
import { MatchSummaryTab } from "../components/MatchSummaryTab";

const MatchControlPage = () => {
  const { matchId } = useParams();
  const { updateStatus } = useVocaliasMutations(Number(matchId));
  const { data: vocalia, isLoading } = useMatchVocalia(Number(matchId));

  useEffect(() => {
    if (vocalia?.match?.status === "programado") {
      updateStatus.mutate({ matchId: Number(matchId), status: "en_curso" });
    }
  }, [vocalia?.match?.status, matchId]);

  if (isLoading) return <div>Cargando partido...</div>;
  if (!vocalia || !vocalia.match) return <div>Partido no encontrado</div>;

  const match = vocalia.match;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <PageHeader
          title={
            <>
              Panel de Control <span className="text-primary">de Partido</span>
            </>
          }
          description={`Administración del encuentro ${match.localTeam?.name} vs ${match.awayTeam?.name}`}
        />
      </div>

      <MatchHeader match={match} />

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">Jugadores (Planilla)</TabsTrigger>
          <TabsTrigger value="events">Eventos (Goles/Tarjetas)</TabsTrigger>
          <TabsTrigger value="summary">Resumen y Acta</TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <MatchPlayersTab match={match} />
        </TabsContent>

        <TabsContent value="events">
          <MatchEventsTab match={match} />
        </TabsContent>

        <TabsContent value="summary">
          <MatchSummaryTab vocalia={vocalia} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchControlPage;
