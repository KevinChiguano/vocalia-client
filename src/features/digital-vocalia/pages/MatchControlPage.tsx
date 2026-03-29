import { useParams } from "react-router-dom";
import { useMatchVocalia, useVocaliasMutations, useMatchPlayers, useMatchGoals } from "../hooks/useVocalias";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { MatchHeader } from "../components/MatchHeader";
import { MatchPlayersTab } from "../components/MatchPlayersTab";
import { MatchEventsTab } from "../components/MatchEventsTab";
import { MatchSummaryTab } from "../components/MatchSummaryTab";
import { SecurityModal } from "../components/SecurityModal";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Play } from "lucide-react";

const MatchControlPage = () => {
  const { matchId } = useParams();
  const { updateStatus } = useVocaliasMutations(Number(matchId));
  const { data: vocalia, isLoading } = useMatchVocalia(Number(matchId));
  const { data: matchPlayers } = useMatchPlayers(Number(matchId));
  const { data: goals } = useMatchGoals(Number(matchId));
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(true);

  // Absolute lists of player IDs in the roster
  const [localPlayersList, setLocalPlayersList] = useState<number[]>([]);
  const [awayPlayersList, setAwayPlayersList] = useState<number[]>([]);
  const [localStartersList, setLocalStartersList] = useState<number[]>([]);
  const [awayStartersList, setAwayStartersList] = useState<number[]>([]);
  const [localCaptainState, setLocalCaptainState] = useState<number | null>(
    null,
  );
  const [awayCaptainState, setAwayCaptainState] = useState<number | null>(null);

  // Sync state from server data
  useEffect(() => {
    if (vocalia) {
      setLocalCaptainState(
        Number(vocalia.localCaptainId || vocalia.local_captain_id) || null,
      );
      setAwayCaptainState(
        Number(vocalia.awayCaptainId || vocalia.away_captain_id) || null,
      );
    }
    
    if (matchPlayers && vocalia?.match) {
        const match = vocalia.match;
        const localId = Number(match.localTeam?.id || match.local_team_id);
        const awayId = Number(match.awayTeam?.id || match.away_team_id);

        setLocalPlayersList(
            matchPlayers
                .filter((mp: any) => Number(mp.team?.id) === localId)
                .map((mp: any) => Number(mp.player?.id))
        );
        setLocalStartersList(
            matchPlayers
                .filter((mp: any) => Number(mp.team?.id) === localId && mp.isStarting)
                .map((mp: any) => Number(mp.player?.id))
        );
        setAwayPlayersList(
            matchPlayers
                .filter((mp: any) => Number(mp.team?.id) === awayId)
                .map((mp: any) => Number(mp.player?.id))
        );
        setAwayStartersList(
            matchPlayers
                .filter((mp: any) => Number(mp.team?.id) === awayId && mp.isStarting)
                .map((mp: any) => Number(mp.player?.id))
        );
    }
  }, [vocalia, matchPlayers]);


  if (isLoading) return <div>Cargando partido...</div>;
  if (!vocalia || !vocalia.match) return <div>Partido no encontrado</div>;

  const match = vocalia.match;

  // Real-time counts from local absolute lists
  const localPlayersTotal = localPlayersList.length;
  const awayPlayersTotal = awayPlayersList.length;

  const hasLocalCaptain = !!localCaptainState;
  const hasAwayCaptain = !!awayCaptainState;

  // Helper to compare current selection with DB data
  const isDirty = (() => {
    if (!matchPlayers || !vocalia) return false;
    
    const localId = Number(match.localTeam?.id || match.local_team_id);
    const awayId = Number(match.awayTeam?.id || match.away_team_id);

    const savedLocalIds = matchPlayers
        .filter((mp: any) => Number(mp.team?.id) === localId)
        .map((mp: any) => Number(mp.player?.id))
        .sort((a: number, b: number) => a - b);
    const savedAwayIds = matchPlayers
        .filter((mp: any) => Number(mp.team?.id) === awayId)
        .map((mp: any) => Number(mp.player?.id))
        .sort((a: number, b: number) => a - b);

    const savedLocalStarters = (matchPlayers || [])
        .filter((mp: any) => Number(mp.team?.id) === localId && mp.isStarting)
        .map((mp: any) => Number(mp.player?.id))
        .sort((a: number, b: number) => a - b);
    const savedAwayStarters = (matchPlayers || [])
        .filter((mp: any) => Number(mp.team?.id) === awayId && mp.isStarting)
        .map((mp: any) => Number(mp.player?.id))
        .sort((a: number, b: number) => a - b);

    const currentLocalSorted = [...localPlayersList].sort((a, b) => a - b);
    const currentAwaySorted = [...awayPlayersList].sort((a, b) => a - b);
    const currentLocalStartersSorted = [...localStartersList].sort((a, b) => a - b);
    const currentAwayStartersSorted = [...awayStartersList].sort((a, b) => a - b);

    const playersChanged = 
        JSON.stringify(savedLocalIds) !== JSON.stringify(currentLocalSorted) ||
        JSON.stringify(savedAwayIds) !== JSON.stringify(currentAwaySorted);

    const lineupChanged = 
        JSON.stringify(savedLocalStarters) !== JSON.stringify(currentLocalStartersSorted) ||
        JSON.stringify(savedAwayStarters) !== JSON.stringify(currentAwayStartersSorted);

    const savedLocalCap = Number(vocalia.localCaptainId || vocalia.local_captain_id) || null;
    const savedAwayCap = Number(vocalia.awayCaptainId || vocalia.away_captain_id) || null;

    const captainsChanged = 
        localCaptainState !== savedLocalCap || 
        awayCaptainState !== savedAwayCap;

    return playersChanged || lineupChanged || captainsChanged;
  })();

  const localScore = (goals || []).reduce((acc, goal: any) => {
    const isLocalPlayer = localPlayersList.includes(Number(goal.player?.id));
    if (goal.isOwnGoal) return isLocalPlayer ? acc : acc + 1;
    return isLocalPlayer ? acc + 1 : acc;
  }, 0);

  const awayScore = (goals || []).reduce((acc, goal: any) => {
    const isAwayPlayer = awayPlayersList.includes(Number(goal.player?.id));
    if (goal.isOwnGoal) return isAwayPlayer ? acc : acc + 1;
    return isAwayPlayer ? acc + 1 : acc;
  }, 0);

  const isRosterReady =
    localPlayersTotal >= 7 &&
    awayPlayersTotal >= 7 &&
    hasLocalCaptain &&
    hasAwayCaptain &&
    !isDirty;

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

      <MatchHeader 
        match={match} 
        localScore={localScore}
        awayScore={awayScore}
      />

      {match.status === "programado" && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500 bg-surface/40 p-6 rounded-2xl border border-dashed border-border">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-bold text-text">Preparación de Partido</h4>
            {isDirty && (
                <p className="text-xs font-bold text-destructive animate-pulse bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20 mt-1">
                    ⚠️ TIENES CAMBIOS SIN GUARDAR. REGÍSTRALOS ANTES DE INICIAR.
                </p>
            )}
            <p className="text-sm text-text-muted">
              {isDirty
                ? "Guarda los cambios en la planilla para poder iniciar el encuentro."
                : (isRosterReady 
                    ? "La planilla está completa y lista. Ya puedes iniciar el encuentro."
                    : "Se requiere un mínimo de 7 jugadores por equipo y sus capitanes para iniciar."
                  )
              }
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${localPlayersTotal >= 7 ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                LOCAL: {localPlayersTotal}/7 JUGADORES
             </div>
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${awayPlayersTotal >= 7 ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                VISITANTE: {awayPlayersTotal}/7 JUGADORES
             </div>
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${hasLocalCaptain ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                CAPITÁN LOCAL: {hasLocalCaptain ? 'SÍ' : 'NO'}
             </div>
             <div className={`px-3 py-1 rounded-full text-[10px] font-bold border ${hasAwayCaptain ? 'bg-success/10 border-success/20 text-success' : 'bg-warning/10 border-warning/20 text-warning'}`}>
                CAPITÁN VISITANTE: {hasAwayCaptain ? 'SÍ' : 'NO'}
             </div>
          </div>

          <Button
            size="lg"
            className="gap-2 font-bold px-10 h-14 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform mt-2"
            disabled={!isRosterReady || updateStatus.isPending}
            onClick={() =>
              updateStatus.mutate({ matchId: Number(matchId), status: "en_curso" })
            }
            loading={updateStatus.isPending}
          >
            <Play className="w-6 h-6 fill-current" />
            INICIAR VOCALÍA
          </Button>
        </div>
      )}

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">
            Jugadores <span className="hidden md:inline ml-1">(Planilla)</span>
          </TabsTrigger>
          <TabsTrigger value="events" disabled={match.status === "programado"}>
            Eventos{" "}
            <span className="hidden md:inline ml-1">(Goles/Tarjetas)</span>
          </TabsTrigger>
          <TabsTrigger value="summary" disabled={match.status === "programado"}>
            Resumen <span className="hidden md:inline ml-1">y Acta</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="players">
          <MatchPlayersTab 
            match={match} 
            localPlayersList={localPlayersList}
            setLocalPlayersList={setLocalPlayersList}
            localStartersList={localStartersList}
            setLocalStartersList={setLocalStartersList}
            awayPlayersList={awayPlayersList}
            setAwayPlayersList={setAwayPlayersList}
            awayStartersList={awayStartersList}
            setAwayStartersList={setAwayStartersList}
            localCaptainState={localCaptainState}
            setLocalCaptainState={setLocalCaptainState}
            awayCaptainState={awayCaptainState}
            setAwayCaptainState={setAwayCaptainState}
          />
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
