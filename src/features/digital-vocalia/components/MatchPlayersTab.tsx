import { getDirectImageUrl } from "@/utils/imageUtils";
import { useQuery } from "@tanstack/react-query";
import { playerApi } from "@/features/qualifications/api/player.api";
import {
  useVocaliasMutations,
  useMatchVocalia,
} from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import {
  Loader2,
  Star,
  Save,
  Info,
  FileText,
  History,
  Shield,
} from "lucide-react";

interface MatchPlayersTabProps {
  match: any;
  localPlayersList: number[];
  setLocalPlayersList: React.Dispatch<React.SetStateAction<number[]>>;
  localStartersList: number[];
  setLocalStartersList: React.Dispatch<React.SetStateAction<number[]>>;
  awayPlayersList: number[];
  setAwayPlayersList: React.Dispatch<React.SetStateAction<number[]>>;
  awayStartersList: number[];
  setAwayStartersList: React.Dispatch<React.SetStateAction<number[]>>;
  localCaptainState: number | null;
  setLocalCaptainState: React.Dispatch<React.SetStateAction<number | null>>;
  awayCaptainState: number | null;
  setAwayCaptainState: React.Dispatch<React.SetStateAction<number | null>>;
}

export const MatchPlayersTab = ({
  match,
  localPlayersList,
  setLocalPlayersList,
  localStartersList,
  setLocalStartersList,
  awayPlayersList,
  setAwayPlayersList,
  awayStartersList,
  setAwayStartersList,
  localCaptainState,
  setLocalCaptainState,
  awayCaptainState,
  setAwayCaptainState,
}: MatchPlayersTabProps) => {
  const matchId = Number(match.id || match.match_id);
  const localTeamId = Number(match.localTeam?.id || match.local_team_id);
  const awayTeamId = Number(match.awayTeam?.id || match.away_team_id);


  const { data: vocalia, isLoading: isLoadingVocalia } =
    useMatchVocalia(matchId);

  const { registerPlayers, updateVocalia, deleteMatchPlayers } = useVocaliasMutations(matchId);

  // Fetch players for both teams
  const { data: localPlayersData, isLoading: isLoadingLocal } = useQuery({
    queryKey: ["players", { teamId: localTeamId }],
    queryFn: () => playerApi.getPlayers({ teamId: localTeamId, limit: 100 }),
    enabled: !!localTeamId,
  });

  const { data: awayPlayersData, isLoading: isLoadingAway } = useQuery({
    queryKey: ["players", { teamId: awayTeamId }],
    queryFn: () => playerApi.getPlayers({ teamId: awayTeamId, limit: 100 }),
    enabled: !!awayTeamId,
  });

  const isLocked = match.status !== "programado";

  const handleRegisterAll = async () => {
    if (isLocked) return;

    // Clear and Redo Players selection to ensure it matches precisely what is on screen
    try {
        // 1. Register local players with starting status
        if (localPlayersList.length > 0) {
            await registerPlayers.mutateAsync({
                matchId,
                teamId: localTeamId,
                players: localPlayersList.map(id => ({
                    playerId: id,
                    isStarting: localStartersList.includes(id)
                })),
            });
        }

        // 3. Register away players with starting status
        if (awayPlayersList.length > 0) {
            await registerPlayers.mutateAsync({
                matchId,
                teamId: awayTeamId,
                players: awayPlayersList.map(id => ({
                    playerId: id,
                    isStarting: awayStartersList.includes(id)
                })),
            });
        }

        // 4. Save Captains
        const currentLocalCap = Number(vocalia?.localCaptainId || vocalia?.local_captain_id);
        const currentAwayCap = Number(vocalia?.awayCaptainId || vocalia?.away_captain_id);

        if (localCaptainState !== currentLocalCap || awayCaptainState !== currentAwayCap) {
            await updateVocalia.mutateAsync({
                matchId,
                data: {
                    localCaptainId: localCaptainState,
                    awayCaptainId: awayCaptainState,
                },
            });
        }
    } catch (error) {
        console.error("Error updating roster:", error);
    }
  };

  const handleToggleCaptain = (playerId: number, isLocal: boolean) => {
    if (isLocked) return;
    if (isLocal) {
      setLocalCaptainState((prev) => (prev === playerId ? null : playerId));
    } else {
      setAwayCaptainState((prev) => (prev === playerId ? null : playerId));
    }
  };


  if (
    isLoadingLocal ||
    isLoadingAway ||
    isLoadingVocalia
  ) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  const localPlayers = localPlayersData?.data || [];
  const awayPlayers = awayPlayersData?.data || [];

  return (
    <div className="max-w-[1600px] mx-auto p-2 md:p-6 font-sans">
      {/* Top Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">
            Gestión de Plantilla del Partido
          </h2>
          <p className="text-text-muted">
            {isLocked 
              ? "La planilla está bloqueada. El partido ya ha iniciado o finalizado."
              : "Seleccione jugadores activos y designe capitanes de equipo antes del inicio del partido."
            }
          </p>
        </div>
        <Button
          onClick={handleRegisterAll}
          disabled={
            isLocked ||
            registerPlayers.isPending ||
            updateVocalia.isPending ||
            deleteMatchPlayers.isPending
          }
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {registerPlayers.isPending || updateVocalia.isPending || deleteMatchPlayers.isPending ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          REGISTRAR / ACTUALIZAR PLANILLA
        </Button>
      </div>

      {/* Roster Section Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Team A Roster Card */}
        <RosterCard
          teamName={match.localTeam?.name}
          teamLogo={match.localTeam?.team_logo}
          role="LOCAL"
          activeCount={localPlayersList.length}
          starterCount={localStartersList.length}
          totalCount={localPlayers.length}
          players={localPlayers}
          selectedIds={localPlayersList}
          starterIds={localStartersList}
          captainId={Number(localCaptainState)}
          onSelect={(id, checked) => {
            if (isLocked) return;
            if (checked) setLocalPlayersList((prev) => [...prev, id]);
            else {
                setLocalPlayersList((prev) => prev.filter((pId) => pId !== id));
                setLocalStartersList((prev) => prev.filter((pId) => pId !== id));
            }
          }}
          onToggleStarter={(id) => {
            if (isLocked) return;
            setLocalStartersList((prev) => 
                prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
            );
          }}
          onToggleCaptain={(id) => handleToggleCaptain(id, true)}
          isLocked={isLocked}
          isCaptainLoading={updateVocalia.isPending}
        />

        {/* Team B Roster Card */}
        <RosterCard
          teamName={match.awayTeam?.name}
          teamLogo={match.awayTeam?.team_logo}
          role="VISITANTE"
          activeCount={awayPlayersList.length}
          starterCount={awayStartersList.length}
          totalCount={awayPlayers.length}
          players={awayPlayers}
          selectedIds={awayPlayersList}
          starterIds={awayStartersList}
          captainId={Number(awayCaptainState)}
          onSelect={(id, checked) => {
            if (isLocked) return;
            if (checked) setAwayPlayersList((prev) => [...prev, id]);
            else {
                setAwayPlayersList((prev) => prev.filter((pId) => pId !== id));
                setAwayStartersList((prev) => prev.filter((pId) => pId !== id));
            }
          }}
          onToggleStarter={(id) => {
            if (isLocked) return;
            setAwayStartersList((prev) => 
                prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
            );
          }}
          onToggleCaptain={(id) => handleToggleCaptain(id, false)}
          isLocked={isLocked}
          isCaptainLoading={updateVocalia.isPending}
        />
      </div>

      {/* Utility Footer */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center bg-surface p-6 rounded-xl border border-border gap-6 shadow-soft">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Info className="text-primary w-5 h-5" />
            <span className="text-sm text-text-muted italic">
              Mínimo 7 jugadores requeridos por equipo para iniciar.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm font-bold text-text opacity-70 hover:opacity-100 transition-opacity"
          >
            <FileText className="w-5 h-5" />
            REPORTE PRE-PARTIDO
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-sm font-bold text-text opacity-70 hover:opacity-100 transition-opacity"
          >
            <History className="w-5 h-5" />
            LOGS DE PLANILLA
          </Button>
        </div>
      </footer>
    </div>
  );
};

import { Checkbox } from "@/components/ui/Checkbox";

interface RosterCardProps {
  teamName: string;
  teamLogo?: string;
  role: "LOCAL" | "VISITANTE";
  activeCount: number;
  starterCount: number;
  totalCount: number;
  players: any[];
  selectedIds: number[];
  starterIds: number[];
  captainId: number;
  onSelect: (id: number, checked: boolean) => void;
  onToggleStarter: (id: number) => void;
  onToggleCaptain: (id: number) => void;
  isLocked: boolean;
  isCaptainLoading: boolean;
}

const RosterCard = ({
  teamName,
  teamLogo,
  role,
  activeCount,
  starterCount,
  totalCount,
  players,
  selectedIds,
  starterIds,
  captainId,
  onSelect,
  onToggleStarter,
  onToggleCaptain,
  isLocked,
  isCaptainLoading,
}: RosterCardProps) => {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-soft flex flex-col h-[700px]">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center border border-border">
            {teamLogo ? (
              <img
                src={getDirectImageUrl(teamLogo)}
                alt={teamName}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <Shield className="w-6 h-6 text-primary" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-tight text-text">
              {teamName}
            </h3>
            <span className="text-xs font-semibold text-primary">
              {activeCount}/{totalCount} JUGADORES ACTIVOS
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-3 py-1 bg-surface border border-border text-text-subtle text-[10px] font-bold rounded-full shadow-sm">
            {role}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-success capitalize">{starterCount} Titulares</span>
            <span className="text-[10px] font-bold text-primary capitalize">{activeCount - starterCount} Suplentes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto roster-scroll bg-surface">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-primary/5 z-10 box-decoration-clone">
            <tr className="text-xs font-bold uppercase text-text-muted border-b border-primary/10 shadow-sm">
              <th className="py-3.5 px-6 w-16 text-center bg-primary/5">Sel</th>
              <th className="py-3.5 px-4 w-16 text-center bg-primary/5">#</th>
              <th className="py-3.5 px-4 bg-primary/5">Jugador</th>
              <th className="py-3.5 px-4 text-center bg-primary/5 w-20">Titular</th>
              <th className="py-3.5 px-4 text-center bg-primary/5 w-20">Capitán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {players.map((player) => {
              const playerId = Number(player.id || player.player_id);
              const isSelected = selectedIds.includes(playerId);
              const isStarter = starterIds.includes(playerId);
              const isCaptain = captainId === playerId;
              const isRowActive = isSelected;

              return (
                <tr
                  key={playerId}
                  className={`transition-colors group ${
                    isCaptain
                      ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                      : isStarter && isRowActive 
                        ? "bg-success/5 hover:bg-success/10" 
                        : "hover:bg-primary/5"
                  } ${!isRowActive && !isCaptain ? "opacity-60 hover:opacity-100" : ""}`}
                >
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isSelected}
                        disabled={isLocked}
                        onCheckedChange={(checked) =>
                          onSelect(playerId, checked as boolean)
                        }
                        className={isLocked ? "opacity-50" : ""}
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div
                      className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full font-bold shadow-sm border ${
                        isCaptain
                          ? "bg-primary text-white border-primary"
                          : "bg-surface text-text border-border"
                      }`}
                    >
                      {player.number || "-"}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-text">
                        {player.name} {player.lastname}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold ${
                          isCaptain ? "text-primary" : "text-text-muted"
                        }`}
                      >
                        {player.position || "JUGADOR"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (!isSelected) onSelect(playerId, true);
                        onToggleStarter(playerId);
                      }}
                      disabled={isLocked}
                      className={`hover:bg-transparent transition-all active:scale-125 ${
                        isStarter
                          ? "scale-110 text-success"
                          : "text-gray-300 dark:text-zinc-600 grayscale opacity-40"
                      }`}
                    >
                      <Shield
                        className={`w-5 h-5 ${isStarter ? "fill-current" : ""}`}
                      />
                    </Button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleCaptain(playerId)}
                      disabled={isCaptainLoading || isLocked}
                      className={`hover:bg-transparent transition-transform active:scale-125 ${
                        isCaptain
                          ? "scale-125"
                          : "text-gray-300 dark:text-zinc-600"
                      }`}
                      style={{ color: isCaptain ? "#FFB800" : undefined }}
                    >
                      <Star
                        className={`w-5 h-5 ${isCaptain ? "fill-current" : ""}`}
                      />
                    </Button>
                  </td>
                </tr>
              );
            })}
            {players.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-text-muted">
                  No hay jugadores disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
