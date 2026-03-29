import { useState, useMemo } from "react";
import {
  useMatchGoals,
  useMatchSanctions,
  useMatchSubstitutions,
  useMatchPlayers,
  useVocaliasMutations,
} from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { ArrowRightLeft, RectangleVertical, Trash2, Plus, Search } from "lucide-react";
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
  ) || [];

  const awayPlayers = matchPlayers?.filter(
    (mp: any) =>
      Number(mp.team?.id || mp.team_id) === awayTeamId ||
      Number(mp.team?.id || mp.team_id) === Number(match.awayTeam?.id),
  ) || [];

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
    if (type === "amarilla") {
      const currentYellows =
        getPlayerSanctions(playerId)?.filter(
          (s: any) => s.type === "amarilla",
        ) || [];
      if (currentYellows.length === 1) {
        addSanction.mutate({
          matchId,
          playerId,
          type: "doble_amarilla" as any,
          time: new Date(),
        });
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

  const renderPlayerRow = (mp: any, idx: number) => {
    const p = mp.player;
    const playerGoals = getPlayerGoals(Number(p.id)) || [];
    const goalCount = playerGoals.length;
    const playerSanctions = getPlayerSanctions(Number(p.id)) || [];
    const isStarter = !!mp.isStarting;

    const yellowCards = playerSanctions.filter(
      (s: any) => s.type === "amarilla",
    );
    const redCard = playerSanctions.find(
      (s: any) =>
        s.type === "roja" ||
        s.type === "roja_directa" ||
        s.type === "roja_indirecta" ||
        s.type === "doble_amarilla",
    );

    const hasSubbedOut = substitutions?.some(
      (s: any) => Number(s.playerOut?.id) === Number(p.id),
    );
    const hasSubbedIn = substitutions?.some(
      (s: any) => Number(s.playerIn?.id) === Number(p.id),
    );

    const isCurrentlyPlaying = (isStarter && !hasSubbedOut) || hasSubbedIn;

    return (
      <tr
        key={`${p.id}-${idx}`}
        className={cn(
          "transition-colors group border-b border-border",
          !isCurrentlyPlaying
            ? "bg-gray-100/50 dark:bg-zinc-900/50 grayscale opacity-60 cursor-not-allowed"
            : "hover:bg-primary/5",
        )}
      >
        <td className="px-5 py-3 font-bold text-text-muted text-sm text-center font-mono w-16">
          {p.number || "-"}
        </td>

        <td className="px-5 py-3 font-medium text-sm text-text">
          <div className="flex items-center gap-2">
            <span
              className={
                !isCurrentlyPlaying
                  ? "line-through text-gray-400 dark:text-text-muted"
                  : "text-text"
              }
            >
              {p.name} {p.lastname}
            </span>
            {hasSubbedOut && (
              <span className="hidden md:inline ml-2 text-[10px] text-danger font-bold px-1.5 py-0.5 bg-danger/10 rounded italic border border-danger/20">
                SALIDA
              </span>
            )}
            {hasSubbedIn && !hasSubbedOut && (
              <span className="hidden md:inline ml-2 text-[10px] text-success font-bold px-1.5 py-0.5 bg-success/10 rounded italic border border-success/20">
                ENTRÓ
              </span>
            )}
            {!isStarter && !hasSubbedIn && (
              <span className="hidden md:inline ml-2 text-[10px] text-primary font-bold px-1.5 py-0.5 bg-primary/10 rounded italic border border-primary/20">
                BANCA
              </span>
            )}
            {redCard && (
              <span className="hidden md:inline ml-2 text-[10px] text-danger font-bold px-1.5 py-0.5 bg-danger/10 rounded italic border border-danger/20 animate-pulse">
                EXPULSADO
              </span>
            )}
          </div>
        </td>

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
              disabled={!isCurrentlyPlaying}
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
                disabled={!isCurrentlyPlaying}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </td>

        <td className="px-5 py-3 text-right w-48">
          <div className="flex justify-end gap-1 items-center">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-3 overflow-visible mr-1">
                {yellowCards.map((yc: any, i: number) => (
                  <button
                    key={yc.id}
                    onClick={() =>
                      setSanctionToDelete({ id: yc.id, type: "amarilla" })
                    }
                    className="hover:-translate-y-1 transition-transform relative group/card"
                    title="Eliminar tarjeta amarilla"
                    disabled={!isCurrentlyPlaying}
                    style={{ zIndex: i }}
                  >
                    <div className="w-6 h-8 bg-yellow-400 rounded-sm shadow-md border border-yellow-500/50 flex items-center justify-center">
                      <span className="text-[8px] font-black text-yellow-900/40">
                        Y
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-red-500 opacity-0 group-hover/card:opacity-20 rounded-sm transition-opacity flex items-center justify-center">
                      <Trash2 className="w-3 h-3 text-white" />
                    </div>
                  </button>
                ))}
              </div>

              {yellowCards.length < 2 && !redCard && (
                <button
                  className="w-10 h-10 flex flex-col items-center justify-center rounded-lg bg-yellow-400/20 border border-yellow-400/30 hover:bg-yellow-400/40 transition-all text-yellow-700 dark:text-yellow-400 group/add"
                  onClick={() => handleAddSanction(Number(p.id), "amarilla")}
                  disabled={!isCurrentlyPlaying}
                  title="Agregar Tarjeta Amarilla"
                >
                  <RectangleVertical className="w-4 h-4 fill-yellow-400 group-hover/add:scale-110 transition-transform" />
                  <span className="text-[7px] font-bold mt-0.5">AMA</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {redCard ? (
                <button
                  onClick={() =>
                    setSanctionToDelete({ id: redCard.id, type: "roja" })
                  }
                  className="hover:-translate-y-1 transition-transform relative group/card"
                  title="Eliminar tarjeta roja"
                  disabled={!isCurrentlyPlaying}
                >
                  <div
                    className={cn(
                      "w-7 h-10 rounded-sm shadow-lg flex items-center justify-center border",
                      redCard.type === "doble_amarilla"
                        ? "bg-red-600 border-yellow-400 border-2"
                        : "bg-red-600 border-red-700",
                    )}
                  >
                    {redCard.type === "doble_amarilla" ? (
                      <div className="flex flex-col items-center leading-none">
                        <span className="text-[7px] font-black text-white">
                          2nd
                        </span>
                        <span className="text-[10px] font-black text-white">
                          Y
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-white">
                        R
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black opacity-0 group-hover/card:opacity-40 rounded-sm transition-opacity flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-white" />
                  </div>
                </button>
              ) : (
                <button
                  className="w-10 h-10 flex flex-col items-center justify-center rounded-lg bg-red-600/20 border border-red-600/30 hover:bg-red-600/40 transition-all text-red-600 group/add"
                  onClick={() =>
                    handleAddSanction(Number(p.id), "roja_directa")
                  }
                  disabled={!isCurrentlyPlaying}
                  title="Agregar Tarjeta Roja Directa"
                >
                  <RectangleVertical className="w-4 h-4 fill-red-600 group-hover/add:scale-110 transition-transform" />
                  <span className="text-[7px] font-bold mt-0.5">ROJ</span>
                </button>
              )}
            </div>
            <div className="w-10 h-10 px-2 flex-shrink-0" />
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
        <div className="flex items-center justify-between px-2 shrink-0">
          <h3 className="font-bold text-lg flex items-center gap-2 text-text">
            <div className={cn("w-2 h-6 rounded-full", colorClass)}></div>
            {teamName}
          </h3>
          <span className="text-xs text-text-muted font-medium uppercase tracking-wider">
            {players.length} Jugadores
          </span>
        </div>

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
              {players.map((mp, idx) => renderPlayerRow(mp, idx))}
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
        localPlayers,
        localTeamId,
        "bg-primary",
      )}

      {renderTeamSection(
        match.awayTeam?.name || "Visitante",
        awayPlayers,
        awayTeamId,
        "bg-gray-400",
      )}

      <Modal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        title="Registrar Cambio"
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <ArrowRightLeft className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-text mb-0.5">
                {subTeamId === localTeamId ? match.localTeam?.name : match.awayTeam?.name}
              </p>
              <p className="text-xs text-text-muted leading-relaxed">
                Busque por número o nombre. Los titulares y los que entraron pueden salir; los de banca pueden entrar.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-danger"></span> SALE JUGADOR
              </Label>
              <SearchablePlayerSelect
                players={(subTeamId === localTeamId ? localPlayers : awayPlayers)
                  .filter((p: any) => {
                    const pid = Number(p.player?.id);
                    const isStarter = !!p.isStarting;
                    const hasOut = substitutions?.some((s: any) => Number(s.playerOut?.id) === pid);
                    const hasIn = substitutions?.some((s: any) => Number(s.playerIn?.id) === pid);
                    const pSanctions = getPlayerSanctions(pid) || [];
                    const hasRed = pSanctions.some((sa: any) => sa.type.includes("roja") || sa.type === "doble_amarilla");
                    
                    const isOnPitch = (isStarter && !hasOut) || (hasIn && !hasOut);
                    return isOnPitch && !hasRed;
                  })}
                value={playerOut}
                onSelect={setPlayerOut}
                placeholder="Escriba número o nombre..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-success"></span> ENTRA JUGADOR
              </Label>
              <SearchablePlayerSelect
                players={(subTeamId === localTeamId ? localPlayers : awayPlayers)
                  .filter((p: any) => {
                    const pid = Number(p.player?.id);
                    const isStarter = !!p.isStarting;
                    const hasIn = substitutions?.some((s: any) => Number(s.playerIn?.id) === pid);
                    const isComingOut = pid === Number(playerOut);
                    
                    const isBench = !isStarter && !hasIn;
                    return isBench && !isComingOut;
                  })}
                value={playerIn}
                onSelect={setPlayerIn}
                placeholder="Escriba número o nombre..."
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-border/40 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsSubModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddSubstitution}
              disabled={!playerOut || !playerIn}
              className="w-full sm:w-auto min-w-[140px] shadow-lg shadow-primary/20"
            >
              Confirmar Cambio
            </Button>
          </div>
        </div>
      </Modal>

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

interface SearchablePlayerSelectProps {
  players: any[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const SearchablePlayerSelect = ({
  players,
  value,
  onSelect,
  placeholder = "Buscar jugador...",
}: SearchablePlayerSelectProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return players;
    const lower = query.toLowerCase();
    return players.filter(
      (p) =>
        p.player?.name?.toLowerCase().includes(lower) ||
        p.player?.lastname?.toLowerCase().includes(lower) ||
        String(p.player?.number).includes(lower),
    );
  }, [players, query]);

  const selectedPlayer = players.find((p) => String(p.player?.id) === value);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={isOpen ? query : (selectedPlayer ? `#${selectedPlayer.player?.number} ${selectedPlayer.player?.name}` : "")}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          placeholder={placeholder}
          className="h-11 border-border bg-elevated/20 focus:ring-primary/20 pr-10"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
           <Search className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute z-50 w-full mt-1 max-h-56 overflow-y-auto bg-surface border border-border rounded-xl shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            {filtered.length > 0 ? (
              filtered.map((p: any, i: number) => (
                <button
                  key={`${p.player?.id}-${i}`}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary/5 transition-colors border-b border-border/40 last:border-none uppercase"
                  onClick={() => {
                    onSelect(String(p.player?.id));
                    setIsOpen(false);
                    setQuery("");
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                       {p.player?.number || "-"}
                    </div>
                    <div className="text-left">
                       <p className="text-sm font-bold text-text leading-none">{p.player?.name} {p.player?.lastname}</p>
                       <p className="text-[10px] text-text-muted mt-1 font-medium italic">{p.isStarting ? 'TITULAR' : 'SUPLENTE'}</p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-text-muted italic text-sm">
                No se encontraron jugadores...
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
