import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { playerApi } from "@/features/qualifications/api/player.api";
import {
  useMatchPlayers,
  useVocaliasMutations,
  useMatchVocalia,
} from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader2, Star } from "lucide-react";

// Simple toast replacement
const toast = {
  error: (msg: string) => alert(msg),
  success: (msg: string) => alert(msg),
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
    return matchPlayers?.some(
      (mp: any) => Number(mp.player?.id) === Number(playerId),
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
        <Loader2 className="animate-spin" />
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

  return (
    <div className="space-y-6 mt-6">
      <div className="flex justify-end">
        <Button
          onClick={handleRegisterAll}
          disabled={
            registerPlayers.isPending ||
            (selectedLocal.length === 0 && selectedAway.length === 0)
          }
        >
          {registerPlayers.isPending ? (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          ) : null}
          Registrar Jugadores / Actualizar Planilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Local Team */}
        <Card>
          <CardHeader>
            <CardTitle>{match.localTeam?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Carnet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localPlayers.map((player: any) => {
                  const playerId = Number(player.id || player.player_id);
                  const isRegistered = isPlayerRegistered(playerId);
                  const isCaptain = localCaptainId === playerId;

                  return (
                    <PlayerRow
                      key={playerId}
                      player={player}
                      isRegistered={isRegistered}
                      isSelected={selectedLocal.includes(playerId)}
                      onSelect={(checked: boolean) => {
                        if (checked) {
                          setSelectedLocal([...selectedLocal, playerId]);
                        } else {
                          setSelectedLocal(
                            selectedLocal.filter((id) => id !== playerId),
                          );
                        }
                      }}
                      isCaptain={isCaptain}
                      onToggleCaptain={() =>
                        handleToggleCaptain(playerId, true)
                      }
                      isCaptainLoading={updateVocalia.isPending}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Away Team */}
        <Card>
          <CardHeader>
            <CardTitle>{match.awayTeam?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Select</TableHead>
                  <TableHead>#</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Carnet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {awayPlayers.map((player: any) => {
                  const playerId = Number(player.id || player.player_id);
                  const isRegistered = isPlayerRegistered(playerId);
                  const isCaptain = awayCaptainId === playerId;

                  return (
                    <PlayerRow
                      key={playerId}
                      player={player}
                      isRegistered={isRegistered}
                      isSelected={selectedAway.includes(playerId)}
                      onSelect={(checked: boolean) => {
                        if (checked) {
                          setSelectedAway([...selectedAway, playerId]);
                        } else {
                          setSelectedAway(
                            selectedAway.filter((id) => id !== playerId),
                          );
                        }
                      }}
                      isCaptain={isCaptain}
                      onToggleCaptain={() =>
                        handleToggleCaptain(playerId, false)
                      }
                      isCaptainLoading={updateVocalia.isPending}
                    />
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper component for player row
const PlayerRow = ({
  player,
  isRegistered,
  isSelected,
  onSelect,
  isCaptain,
  onToggleCaptain,
  isCaptainLoading,
}: any) => {
  const cardUrl = player.card_image_url || player.cardUrl;

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={isSelected || isRegistered}
          disabled={isRegistered}
          onCheckedChange={onSelect}
        />
      </TableCell>
      <TableCell>{player.number || "-"}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>
            {player.name} {player.lastname}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${isCaptain ? "text-yellow-500 hover:text-yellow-600" : "text-gray-300 hover:text-yellow-400"}`}
            onClick={onToggleCaptain}
            disabled={isCaptainLoading}
            title={isCaptain ? "Quitar capitán" : "Designar capitán"}
          >
            <Star className={`w-4 h-4 ${isCaptain ? "fill-current" : ""}`} />
          </Button>
        </div>
      </TableCell>
      <TableCell>
        {cardUrl ? (
          <img
            src={cardUrl}
            alt="Carnet"
            className="w-10 h-10 object-cover rounded"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No Img</span>
        )}
      </TableCell>
    </TableRow>
  );
};
