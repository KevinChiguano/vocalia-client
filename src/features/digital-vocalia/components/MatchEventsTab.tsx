import { useState } from "react";
import {
  useMatchGoals,
  useMatchSanctions,
  useMatchSubstitutions,
  useMatchPlayers,
  useVocaliasMutations,
} from "../hooks/useVocalias";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, ArrowRightLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Loader2 } from "lucide-react";

interface MatchEventsTabProps {
  match: any;
}

export const MatchEventsTab = ({ match }: MatchEventsTabProps) => {
  const matchId = Number(match.id || match.match_id);
  const localTeamId = Number(match.localTeam?.id || match.local_team_id);
  const awayTeamId = Number(match.awayTeam?.id || match.away_team_id);

  const { data: goals } = useMatchGoals(matchId);
  const { data: sanctions } = useMatchSanctions(matchId);
  const { data: substitutions } = useMatchSubstitutions(matchId);
  const { data: matchPlayers } = useMatchPlayers(matchId);

  const {
    addGoal,
    deleteGoal,
    addSanction,
    deleteSanction,
    addSubstitution,
    deleteSubstitution,
  } = useVocaliasMutations(matchId);

  // States for Substitutions Modal
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subTeamId, setSubTeamId] = useState<number | null>(null);
  const [playerOut, setPlayerOut] = useState<string>("");
  const [playerIn, setPlayerIn] = useState<string>("");

  const localPlayers = matchPlayers?.filter(
    (mp: any) =>
      Number(mp.team?.id || mp.team_id) === localTeamId ||
      Number(mp.team?.id || mp.team_id) === Number(match.localTeam?.id),
  );

  const awayPlayers = matchPlayers?.filter(
    (mp: any) =>
      Number(mp.team?.id || mp.team_id) === awayTeamId ||
      Number(mp.team?.id || mp.team_id) === Number(match.awayTeam?.id),
  );

  const getPlayerGoals = (playerId: number) => {
    return goals?.filter((g: any) => Number(g.player?.id) === Number(playerId));
  };

  const getPlayerSanctions = (playerId: number) => {
    return sanctions?.filter(
      (s: any) => Number(s.player?.id) === Number(playerId),
    );
  };

  const handleAddGoal = (playerId: number) => {
    addGoal.mutate({
      matchId,
      playerId,
      time: new Date(),
      isOwnGoal: false,
    });
  };

  const handleAddSanction = (playerId: number, type: string) => {
    addSanction.mutate({
      matchId,
      playerId,
      type: type as any,
      time: new Date(),
    });
  };

  const handleAddSubstitution = () => {
    if (!playerOut || !playerIn) return;
    addSubstitution.mutate(
      {
        matchId,
        playerOutId: Number(playerOut),
        playerInId: Number(playerIn),
        time: new Date(),
      },
      {
        onSuccess: () => {
          setIsSubModalOpen(false);
          setPlayerOut("");
          setPlayerIn("");
          setSubTeamId(null);
        },
      },
    );
  };

  const openSubModal = (teamId: number) => {
    setSubTeamId(teamId);
    setIsSubModalOpen(true);
  };

  const renderTeamSheet = (
    teamName: string,
    players: any[],
    teamId: number,
  ) => {
    const teamSubstitutions = substitutions?.filter((s: any) => {
      const pOut = players.find(
        (p: any) => Number(p.player?.id) === Number(s.playerOut?.id),
      );
      return !!pOut;
    });

    const totalGoals = goals?.filter((g: any) => {
      const p = players.find(
        (pl: any) => Number(pl.player?.id) === Number(g.player?.id),
      );
      return !!p;
    }).length;

    return (
      <Card className="flex flex-col h-full border-2 border-border shadow-soft bg-surface">
        <CardHeader className="bg-row-alt py-3 border-b border-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold uppercase text-text">
              {teamName}
            </CardTitle>
            <div className="flex flex-col items-end">
              <span className="text-xs text-text-muted font-semibold">
                GOLES TOTALES
              </span>
              <span className="text-2xl font-bold leading-none text-text">
                {totalGoals || 0}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 flex flex-col">
          {/* PLAYERS LIST */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm ui-table">
              <thead className="bg-elevated text-text-muted font-semibold border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-2 text-center w-10">#</th>
                  <th className="py-2 px-2 text-left">JUGADOR</th>
                  <th className="py-2 px-2 text-center w-36">GOLES</th>
                  <th className="py-2 px-2 text-center w-32">TARJETAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {players?.map((mp: any) => {
                  const p = mp.player;
                  const playerGoals = getPlayerGoals(Number(p.id)) || [];
                  const goalCount = playerGoals.length;
                  const playerSanctions = getPlayerSanctions(Number(p.id));

                  return (
                    <tr key={p.id} className="hover:bg-hover transition-colors">
                      <td className="py-3 px-2 text-center text-text-subtle font-mono">
                        {p.number || "-"}
                      </td>
                      <td className="py-3 px-2 font-medium text-text">
                        {p.name}
                        {p.lastname ? ` ${p.lastname}` : ""}
                      </td>
                      <td className="py-3 px-2">
                        {/* GOAL COUNTER */}
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 rounded-sm border border-border bg-surface text-text hover:bg-hover disabled:opacity-30"
                            disabled={goalCount === 0}
                            onClick={() => {
                              if (goalCount > 0) {
                                // Find last goal to delete
                                const lastGoal =
                                  playerGoals[playerGoals.length - 1];
                                if (lastGoal) deleteGoal.mutate(lastGoal.id);
                              }
                            }}
                          >
                            -
                          </Button>
                          <span className="w-6 text-center font-bold text-lg text-text">
                            {goalCount}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 rounded-sm border border-border bg-surface text-text hover:bg-hover"
                            onClick={() => handleAddGoal(Number(p.id))}
                          >
                            +
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-3">
                          {/* YELLOW CARD */}
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {playerSanctions
                                ?.filter((s: any) => s.type === "amarilla")
                                .map((s: any) => (
                                  <div
                                    key={s.id}
                                    className="w-5 h-7 bg-yellow-400 border border-yellow-500 rounded-[2px] shadow-sm cursor-pointer hover:z-10 transition-all hover:scale-110"
                                    title="Eliminar tarjeta amarilla"
                                    onClick={() => {
                                      if (
                                        confirm("¿Eliminar tarjeta amarilla?")
                                      ) {
                                        deleteSanction.mutate(s.id);
                                      }
                                    }}
                                  />
                                ))}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 rounded-md p-0 bg-yellow-400/10 text-yellow-600 hover:bg-yellow-400/20 border border-yellow-400/30 ml-1"
                              disabled={
                                (playerSanctions?.filter(
                                  (s: any) => s.type === "amarilla",
                                ).length || 0) >= 2
                              }
                              onClick={() => {
                                if (
                                  (playerSanctions?.filter(
                                    (s: any) => s.type === "amarilla",
                                  ).length || 0) >= 2
                                )
                                  return;
                                handleAddSanction(Number(p.id), "amarilla");
                              }}
                              title="Agregar Tarjeta Amarilla"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* RED CARD */}
                          <div className="flex items-center gap-1">
                            {playerSanctions?.some(
                              (s: any) => s.type === "roja_directa",
                            ) && (
                              <div
                                className="w-5 h-7 bg-red-600 border border-red-700 rounded-[2px] shadow-sm cursor-pointer hover:scale-110 transition-transform"
                                title="Eliminar tarjeta roja"
                                onClick={() => {
                                  const s = playerSanctions.find(
                                    (s: any) => s.type === "roja_directa",
                                  );
                                  if (s && confirm("¿Eliminar tarjeta roja?")) {
                                    deleteSanction.mutate(s.id);
                                  }
                                }}
                              />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 rounded-md p-0 bg-red-600/10 text-red-600 hover:bg-red-600/20 border border-red-600/30 ml-1"
                              disabled={playerSanctions?.some(
                                (s: any) => s.type === "roja_directa",
                              )}
                              onClick={() => {
                                if (
                                  playerSanctions?.some(
                                    (s: any) => s.type === "roja_directa",
                                  )
                                )
                                  return;
                                handleAddSanction(Number(p.id), "roja_directa");
                              }}
                              title="Agregar Tarjeta Roja"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!players || players.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-12 text-center text-text-muted text-sm"
                    >
                      No hay jugadores registrados en planilla.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* SUBSTITUTIONS SECTION */}
          <div className="border-t border-border bg-row-alt p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Cambios
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => openSubModal(teamId)}
              >
                <ArrowRightLeft className="w-3 h-3 mr-1" /> Registrar
              </Button>
            </div>
            <div className="space-y-1">
              {teamSubstitutions?.map((sub: any) => {
                const pOut = players.find(
                  (p: any) =>
                    Number(p.player?.id) === Number(sub.playerOut?.id),
                );
                const pIn = players.find(
                  (p: any) => Number(p.player?.id) === Number(sub.playerIn?.id),
                );
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between text-xs bg-surface border border-border rounded px-2 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-danger font-bold">
                        {pOut?.player?.number || "#"} Sale
                      </span>
                      <span className="text-text-subtle">→</span>
                      <span className="text-success font-bold">
                        {pIn?.player?.number || "#"} Entra
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      isIconOnly
                      size="sm"
                      className="h-4 w-4 text-text-muted hover:text-danger"
                      onClick={() => deleteSubstitution.mutate(sub.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                );
              })}
              {(!teamSubstitutions || teamSubstitutions.length === 0) && (
                <p className="text-xs text-text-muted italic">
                  Sin cambios registrados
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-[calc(100vh-250px)] min-h-[600px] flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 h-full">
        {renderTeamSheet(
          match.localTeam?.name || "Local",
          localPlayers || [],
          localTeamId,
        )}
        {renderTeamSheet(
          match.awayTeam?.name || "Visitante",
          awayPlayers || [],
          awayTeamId,
        )}
      </div>

      {/* SUBSTITUTION MODAL */}
      <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Cambio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Sale (Jugador)</Label>
              <Select
                onChange={(e) => setPlayerOut(e.target.value)}
                value={playerOut}
              >
                <option value="">Seleccionar Jugador</option>
                {(subTeamId === localTeamId ? localPlayers : awayPlayers)?.map(
                  (p: any) => (
                    <option key={p.player?.id} value={String(p.player?.id)}>
                      {p.player?.number ? `#${p.player?.number} ` : ""}
                      {p.player?.name}
                    </option>
                  ),
                )}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Entra (Jugador)</Label>
              <Select
                onChange={(e) => setPlayerIn(e.target.value)}
                value={playerIn}
              >
                <option value="">Seleccionar Jugador</option>
                {(subTeamId === localTeamId ? localPlayers : awayPlayers)?.map(
                  (p: any) => (
                    <option key={p.player?.id} value={String(p.player?.id)}>
                      {p.player?.number ? `#${p.player?.number} ` : ""}
                      {p.player?.name}
                    </option>
                  ),
                )}
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleAddSubstitution}
              disabled={!playerOut || !playerIn}
            >
              Guardar Cambio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
