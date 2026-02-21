import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { playerApi } from "@/features/qualifications/api/player.api";
import {
  useMatchPlayers,
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

import { useUIStore } from "@/store/ui.store";

// Mock del objeto toast
const toast = {
  error: (msg: string) =>
    useUIStore.getState().setNotification("Error", msg, "error"),
  success: (msg: string) =>
    useUIStore.getState().setNotification("Éxito", msg, "success"),
};

interface MatchPlayersTabProps {
  match: any;
}

export const MatchPlayersTab = ({ match }: MatchPlayersTabProps) => {
  const matchId = Number(match.id || match.match_id);
  const localTeamId = Number(match.localTeam?.id || match.local_team_id);
  const awayTeamId = Number(match.awayTeam?.id || match.away_team_id);

  const { data: matchPlayers, isLoading: isLoadingMatchPlayers } =
    useMatchPlayers(matchId);

  const { data: vocalia, isLoading: isLoadingVocalia } =
    useMatchVocalia(matchId);

  const { registerPlayers, updateVocalia } = useVocaliasMutations(matchId);

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

  const [selectedLocal, setSelectedLocal] = useState<number[]>([]);
  const [selectedAway, setSelectedAway] = useState<number[]>([]);

  const handleRegisterAll = async () => {
    if (selectedLocal.length === 0 && selectedAway.length === 0) {
      toast.error("Selecciona al menos un jugador de algún equipo");
      return;
    }

    if (selectedLocal.length > 0) {
      registerPlayers.mutate({
        matchId: matchId,
        teamId: localTeamId,
        playerIds: selectedLocal,
        isStarting: true,
      });
    }

    if (selectedAway.length > 0) {
      registerPlayers.mutate({
        matchId: matchId,
        teamId: awayTeamId,
        playerIds: selectedAway,
        isStarting: true,
      });
    }
  };

  const handleToggleCaptain = (playerId: number, isLocal: boolean) => {
    const isCaptain =
      vocalia?.localCaptainId === playerId ||
      vocalia?.awayCaptainId === playerId ||
      vocalia?.local_captain_id === playerId ||
      vocalia?.away_captain_id === playerId;

    if (isCaptain) {
      // Remove captain
      updateVocalia.mutate({
        matchId,
        data: isLocal ? { localCaptainId: null } : { awayCaptainId: null },
      });
    } else {
      // Set captain
      updateVocalia.mutate({
        matchId,
        data: isLocal
          ? { localCaptainId: playerId }
          : { awayCaptainId: playerId },
      });
    }
  };

  const isPlayerRegistered = (playerId: number) => {
    return (
      matchPlayers?.some(
        (mp: any) => Number(mp.player?.id) === Number(playerId),
      ) ?? false
    );
  };

  if (
    isLoadingLocal ||
    isLoadingAway ||
    isLoadingMatchPlayers ||
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
  const localCaptainId = Number(
    vocalia?.localCaptainId || vocalia?.local_captain_id,
  );
  const awayCaptainId = Number(
    vocalia?.awayCaptainId || vocalia?.away_captain_id,
  );

  const localActiveCount = localPlayers.filter((p: any) =>
    isPlayerRegistered(p.id || p.player_id),
  ).length;
  const awayActiveCount = awayPlayers.filter((p: any) =>
    isPlayerRegistered(p.id || p.player_id),
  ).length;

  return (
    <div className="max-w-[1600px] mx-auto p-2 md:p-6 font-sans">
      {/* Top Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text">
            Gestión de Plantilla del Partido
          </h2>
          <p className="text-text-muted">
            Seleccione jugadores activos y designe capitanes de equipo antes del
            inicio del partido.
          </p>
        </div>
        <Button
          onClick={handleRegisterAll}
          disabled={
            registerPlayers.isPending ||
            (selectedLocal.length === 0 && selectedAway.length === 0)
          }
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
        >
          {registerPlayers.isPending ? (
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
          activeCount={localActiveCount}
          totalCount={localPlayers.length}
          players={localPlayers}
          selectedIds={selectedLocal}
          captainId={localCaptainId}
          onSelect={(id, checked) => {
            if (checked) setSelectedLocal((prev) => [...prev, id]);
            else setSelectedLocal((prev) => prev.filter((pId) => pId !== id));
          }}
          onToggleCaptain={(id) => handleToggleCaptain(id, true)}
          isPlayerRegistered={isPlayerRegistered}
          isCaptainLoading={updateVocalia.isPending}
        />

        {/* Team B Roster Card */}
        <RosterCard
          teamName={match.awayTeam?.name}
          teamLogo={match.awayTeam?.team_logo}
          role="VISITANTE"
          activeCount={awayActiveCount}
          totalCount={awayPlayers.length}
          players={awayPlayers}
          selectedIds={selectedAway}
          captainId={awayCaptainId}
          onSelect={(id, checked) => {
            if (checked) setSelectedAway((prev) => [...prev, id]);
            else setSelectedAway((prev) => prev.filter((pId) => pId !== id));
          }}
          onToggleCaptain={(id) => handleToggleCaptain(id, false)}
          isPlayerRegistered={isPlayerRegistered}
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
  totalCount: number;
  players: any[];
  selectedIds: number[];
  captainId: number;
  onSelect: (id: number, checked: boolean) => void;
  onToggleCaptain: (id: number) => void;
  isPlayerRegistered: (id: number) => boolean;
  isCaptainLoading: boolean;
}

const RosterCard = ({
  teamName,
  teamLogo,
  role,
  activeCount,
  totalCount,
  players,
  selectedIds,
  captainId,
  onSelect,
  onToggleCaptain,
  isPlayerRegistered,
  isCaptainLoading,
}: RosterCardProps) => {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-soft flex flex-col h-[700px]">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-surface">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12  rounded-lg flex items-center justify-center border border-border">
            {teamLogo ? (
              <img
                src={teamLogo}
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
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-surface border border-border text-text-subtle text-xs font-bold rounded-full shadow-sm">
            {role}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto roster-scroll bg-surface">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-primary/5 z-10 box-decoration-clone">
            <tr className="text-xs font-bold uppercase text-text-muted border-b border-primary/10 shadow-sm">
              <th className="py-3.5 px-6 w-16 text-center bg-primary/5">Sel</th>
              <th className="py-3.5 px-4 w-16 text-center bg-primary/5">#</th>
              <th className="py-3.5 px-4 bg-primary/5">Jugador</th>
              <th className="py-3.5 px-4 text-center bg-primary/5">Capitán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm">
            {players.map((player) => {
              const playerId = Number(player.id || player.player_id);
              const isRegistered = isPlayerRegistered(playerId);
              const isSelected = selectedIds.includes(playerId);
              const isCaptain = captainId === playerId;
              const isRowActive = isRegistered || isSelected;

              return (
                <tr
                  key={playerId}
                  className={`transition-colors group ${
                    isCaptain
                      ? "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                      : "hover:bg-primary/5"
                  } ${!isRowActive && !isCaptain ? "opacity-60 hover:opacity-100" : ""}`}
                >
                  <td className="py-3 px-6 text-center">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isSelected || isRegistered}
                        disabled={isRegistered}
                        onCheckedChange={(checked) =>
                          onSelect(playerId, checked as boolean)
                        }
                        className={isRegistered ? "opacity-50" : ""}
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
                      onClick={() => onToggleCaptain(playerId)}
                      disabled={isCaptainLoading}
                      className={`hover:bg-transparent transition-transform active:scale-95 ${
                        isCaptain
                          ? "text-primary scale-125"
                          : "text-gray-300 dark:text-zinc-600 hover:text-primary"
                      }`}
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
