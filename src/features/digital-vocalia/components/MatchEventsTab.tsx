import { useState } from "react";
import {
  useMatchGoals,
  useMatchSanctions,
  useMatchSubstitutions,
  useMatchPlayers,
  useVocaliasMutations,
} from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { ArrowRightLeft, RectangleVertical, Trash2, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

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

  // States for Sanction Deletion Confirm Modal
  const [sanctionToDelete, setSanctionToDelete] = useState<{
    id: number;
    type: "amarilla" | "roja";
  } | null>(null);

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
    // Auto-Red Card Logic
    if (type === "amarilla") {
      const currentYellows =
        getPlayerSanctions(playerId)?.filter(
          (s: any) => s.type === "amarilla",
        ) || [];
      if (currentYellows.length === 1) {
        // Already has 1, adding 2nd -> trigger Red
        // Add the 2nd Yellow first (which is what we are doing here)
        // Then logic to add Red.
        // Note: Since mutations are async, we should probably add the red card separately
        // BUT, usually a double yellow implies a red.
        // I will add the yellow, and also add a red.

        // Add the yellow
        addSanction.mutate({
          matchId,
          playerId,
          type: "amarilla" as any,
          time: new Date(),
        });

        // Add the red (indirect)
        setTimeout(() => {
          addSanction.mutate({
            matchId,
            playerId,
            type: "roja_indirecta" as any, // Assuming 'roja_indirecta' exists, if not 'roja'
            time: new Date(),
          });
        }, 100);
        return;
      }
    }

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

  const openSubModal = (teamId: number, playerOutId?: number) => {
    setSubTeamId(teamId);
    if (playerOutId) setPlayerOut(String(playerOutId));
    setIsSubModalOpen(true);
  };

  const renderPlayerRow = (mp: any, idx: number, teamId: number) => {
    const p = mp.player;
    const playerGoals = getPlayerGoals(Number(p.id)) || [];
    const goalCount = playerGoals.length;
    const playerSanctions = getPlayerSanctions(Number(p.id)) || [];
    const yellowCards = playerSanctions.filter(
      (s: any) => s.type === "amarilla",
    );
    const redCard = playerSanctions.find(
      (s: any) =>
        s.type === "roja" ||
        s.type === "roja_directa" ||
        s.type === "roja_indirecta",
    );

    // Check if player is substituted out
    const isSubstitutedOut = substitutions?.some(
      (s: any) => Number(s.playerOut?.id) === Number(p.id),
    );

    return (
      <tr
        key={`${p.id}-${idx}`}
        className={cn(
          "transition-colors group border-b border-border",
          isSubstitutedOut
            ? "bg-gray-100/50 dark:bg-zinc-900/50 grayscale opacity-60 cursor-not-allowed"
            : "hover:bg-primary/5",
        )}
      >
        {/* Number */}
        <td className="px-5 py-3 font-bold text-text-muted text-sm text-center font-mono w-16">
          {p.number || "-"}
        </td>

        {/* Name */}
        <td className="px-5 py-3 font-medium text-sm text-text">
          <div className="flex items-center gap-2">
            <span
              className={
                isSubstitutedOut
                  ? "line-through text-gray-500 dark:text-text-muted"
                  : "text-text"
              }
            >
              {p.name} {p.lastname}
            </span>
            {isSubstitutedOut && (
              <span className="hidden md:inline ml-2 text-[10px] text-text-muted font-bold px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded italic">
                SALE
              </span>
            )}
          </div>
        </td>

        {/* Goals Action */}
        <td className="px-5 py-3 text-center w-32">
          <div className="flex justify-center items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 px-2 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary gap-1",
                goalCount > 0 && "bg-primary/5",
              )}
              onClick={() => handleAddGoal(Number(p.id))}
              disabled={isSubstitutedOut}
            >
              <span className="text-[10px] font-bold flex flex-col md:flex-row items-center md:gap-1 leading-none">
                <span>+</span>
                <span className="hidden md:inline">GOL</span>
              </span>
              {goalCount > 0 && (
                <span className="bg-primary text-white text-[10px] px-1.5 min-w-5 h-5 flex items-center justify-center rounded-full leading-none ml-0.5">
                  {goalCount}
                </span>
              )}
            </Button>
            {goalCount > 0 && (
              <button
                onClick={() => {
                  const lastGoal = playerGoals[playerGoals.length - 1];
                  if (lastGoal) deleteGoal.mutate(lastGoal.id);
                }}
                className="ml-1 text-text-muted hover:text-danger p-1 transition-opacity"
                title="Borrar último gol"
                disabled={isSubstitutedOut}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>

        {/* Cards & Actions */}
        <td className="px-5 py-3 text-right w-48">
          <div className="flex justify-end gap-1 items-center">
            {/* Yellow Card Section */}
            <div className="flex items-center gap-0.5 md:gap-1">
              {yellowCards.map((yc: any) => (
                <button
                  key={yc.id}
                  onClick={() =>
                    setSanctionToDelete({ id: yc.id, type: "amarilla" })
                  }
                  className="hover:scale-110 transition-transform"
                  title="Eliminar tarjeta amarilla"
                  disabled={isSubstitutedOut}
                >
                  <RectangleVertical className="w-5 h-5 fill-yellow-400 text-yellow-500" />
                </button>
              ))}

              {yellowCards.length < 2 && !redCard && (
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-yellow-400/10 transition-colors text-gray-300 dark:text-gray-600 hover:text-yellow-400"
                  onClick={() => handleAddSanction(Number(p.id), "amarilla")}
                  disabled={isSubstitutedOut}
                  title="Agregar Tarjeta Amarilla"
                >
                  <Plus className="w-4 h-4" />
                  <RectangleVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Red Card Section */}
            <div className="flex items-center gap-1">
              {redCard && (
                <button
                  onClick={() =>
                    setSanctionToDelete({ id: redCard.id, type: "roja" })
                  }
                  className="hover:scale-110 transition-transform"
                  title="Eliminar tarjeta roja"
                  disabled={isSubstitutedOut}
                >
                  <RectangleVertical className="w-5 h-5 fill-red-600 text-red-700" />
                </button>
              )}

              {!redCard && (
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-600/10 transition-colors text-gray-300 dark:text-gray-600 hover:text-red-500"
                  onClick={() =>
                    handleAddSanction(Number(p.id), "roja_directa")
                  }
                  disabled={isSubstitutedOut}
                  title="Agregar Tarjeta Roja Directa"
                >
                  <Plus className="w-4 h-4" />
                  <RectangleVertical className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Substitute */}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-white/5 text-text-muted transition-colors ml-1"
              onClick={() => openSubModal(teamId, Number(p.id))}
              disabled={isSubstitutedOut}
              title="Sustitución"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderTeamSection = (
    teamName: string,
    players: any[],
    teamId: number,
    colorClass: string = "bg-primary",
  ) => {
    return (
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between px-2 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-text">
            <div className={cn("w-2 h-6 rounded-full", colorClass)}></div>
            {teamName}
          </h3>
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {players.length} Jugadores
          </span>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
          <table className="w-full text-left border-collapse">
            <thead className="bg-primary/5 text-xs uppercase font-bold text-text-muted border-b border-primary/10">
              <tr>
                <th className="px-5 py-3.5 w-16 text-center">#</th>
                <th className="px-5 py-3.5">Jugador</th>
                <th className="px-5 py-3.5 text-center w-32">Goles</th>
                <th className="px-5 py-3.5 text-right w-48">
                  Tarjetas / Acciones
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border">
              {players.map((mp, idx) => renderPlayerRow(mp, idx, teamId))}
              {players.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-text-muted italic flex flex-col items-center gap-2"
                  >
                    No hay jugadores registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Substitutions Footer for Team */}
        <div className="bg-surface border border-border rounded-xl p-4 shrink-0 mt-2">
          <div className="flex items-center gap-2 mb-3">
            <ArrowRightLeft className="w-4 h-4 text-text-muted" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted">
              Cambios {teamName}
            </h4>
          </div>

          <div className="space-y-2 mb-2">
            {substitutions
              ?.filter((s) => {
                const pOut = players.find(
                  (p) => Number(p.player?.id) === Number(s.playerOut?.id),
                );
                return !!pOut;
              })
              .map((sub: any) => {
                const pOut = players.find(
                  (p) => Number(p.player?.id) === Number(sub.playerOut?.id),
                );
                const pIn = players.find(
                  (p) => Number(p.player?.id) === Number(sub.playerIn?.id),
                );
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-2 rounded-lg border border-border transition-colors hover:border-primary/30 group"
                  >
                    <div className="flex items-center gap-3 text-xs w-full">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <span className="text-danger font-bold truncate">
                          OUT #{pOut?.player?.number}
                        </span>
                        <ArrowRightLeft className="w-3 h-3 text-text-muted shrink-0" />
                        <span className="text-success font-bold truncate">
                          IN #{pIn?.player?.number}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSubstitution.mutate(sub.id)}
                      className="text-text-muted hover:text-danger ml-2 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            {(substitutions?.filter((s) =>
              players.find(
                (p) => Number(p.player?.id) === Number(s.playerOut?.id),
              ),
            ).length || 0) === 0 && (
              <div className="text-xs text-text-muted italic py-1 text-center">
                Sin cambios registrados
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full text-xs h-8 border-dashed text-text-muted hover:text-primary hover:border-primary/50"
            onClick={() => openSubModal(teamId)}
          >
            <Plus className="w-3 h-3 mr-1" /> REGISTRAR CAMBIO
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 p-1 pb-20">
      {renderTeamSection(
        match.localTeam?.name || "Local",
        localPlayers || [],
        localTeamId,
        "bg-primary",
      )}

      {renderTeamSection(
        match.awayTeam?.name || "Visitante",
        awayPlayers || [],
        awayTeamId,
        "bg-gray-400",
      )}

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
                  (p: any, pIdx: number) => (
                    <option
                      key={`${p.player?.id}-${pIdx}`}
                      value={String(p.player?.id)}
                    >
                      {p.player?.number ? `#${p.player?.number} ` : ""}
                      {p.player?.name} {p.player?.lastname}
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
                  (p: any, pIdx: number) => (
                    <option
                      key={`${p.player?.id}-${pIdx}-in`}
                      value={String(p.player?.id)}
                    >
                      {p.player?.number ? `#${p.player?.number} ` : ""}
                      {p.player?.name} {p.player?.lastname}
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

      <ConfirmModal
        open={!!sanctionToDelete}
        onClose={() => setSanctionToDelete(null)}
        onConfirm={() => {
          if (sanctionToDelete) {
            deleteSanction.mutate(sanctionToDelete.id);
            setSanctionToDelete(null);
          }
        }}
        title={`Eliminar tarjeta ${sanctionToDelete?.type}`}
        description={`¿Estás seguro de que deseas eliminar esta tarjeta ${sanctionToDelete?.type}? Esta acción no se puede deshacer.`}
        danger
      />
    </div>
  );
};
