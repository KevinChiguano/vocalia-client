import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useMatchVocalia, useVocaliasMutations } from "../hooks/useVocalias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MatchHeader } from "../components/MatchHeader";
import { MatchPlayersTab } from "../components/MatchPlayersTab";
import { MatchEventsTab } from "../components/MatchEventsTab";
import { MatchSummaryTab } from "../components/MatchSummaryTab";
import { SecurityModal } from "../components/SecurityModal";
import { useState } from "react";

const MatchControlPage = () => {
  const { matchId } = useParams();
  const { updateStatus } = useVocaliasMutations(Number(matchId));
  const { data: vocalia, isLoading } = useMatchVocalia(Number(matchId));
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(true);

  useEffect(() => {
    if (vocalia?.match?.status === "programado") {
      updateStatus.mutate({ matchId: Number(matchId), status: "en_curso" });
    }
  }, [vocalia?.match?.status, matchId]);

  if (isLoading) return <div>Cargando partido...</div>;
  if (!vocalia || !vocalia.match) return <div>Partido no encontrado</div>;

  const match = vocalia.match;

  if (!isAuthorized) {
    return (
      <SecurityModal
        open={showSecurityModal}
        matchId={Number(matchId)}
        onSuccess={() => {
          setIsAuthorized(true);
          setShowSecurityModal(false);
        }}
        onCancel={() => window.history.back()}
      />
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
          <TabsTrigger value="players">
            Jugadores <span className="hidden md:inline ml-1">(Planilla)</span>
          </TabsTrigger>
          <TabsTrigger value="events">
            Eventos{" "}
            <span className="hidden md:inline ml-1">(Goles/Tarjetas)</span>
          </TabsTrigger>
          <TabsTrigger value="summary">
            Resumen <span className="hidden md:inline ml-1">y Acta</span>
          </TabsTrigger>
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
