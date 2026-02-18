import {
  useVocaliasMutations,
  useMatchGoals,
  useMatchSanctions,
  useMatchPlayers,
} from "../hooks/useVocalias";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState, useEffect, useRef } from "react";
import { SignaturePad, SignaturePadRef } from "@/components/ui/SignaturePad";

interface MatchSummaryTabProps {
  vocalia: any;
}

export const MatchSummaryTab = ({ vocalia }: MatchSummaryTabProps) => {
  const match = vocalia.match;
  const matchId = Number(match.match_id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [localAmount, setLocalAmount] = useState<string>("");
  const [awayAmount, setAwayAmount] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [arbitratorName, setArbitratorName] = useState<string>("");

  const localSigRef = useRef<SignaturePadRef>(null);
  const awaySigRef = useRef<SignaturePadRef>(null);

  useEffect(() => {
    if (vocalia) {
      if (vocalia.vocaliaData) {
        setLocalAmount(vocalia.vocaliaData.localAmount || "");
        setAwayAmount(vocalia.vocaliaData.awayAmount || "");
      }
      setObservations(vocalia.observations || "");
      if (vocalia.arbitratorName) setArbitratorName(vocalia.arbitratorName);
    }
  }, [vocalia]);

  const { finalizeMatch, updateVocalia, revertMatch } =
    useVocaliasMutations(matchId);
  const { data: goals } = useMatchGoals(matchId);
  const { data: sanctions } = useMatchSanctions(matchId);
  const { data: matchPlayers } = useMatchPlayers(matchId);

  const localGoals =
    goals?.filter((g: any) => {
      const player = matchPlayers?.find(
        (mp: any) => mp.player?.id === g.player?.id,
      );
      return Number(player?.team?.id) === Number(match.localTeam?.id);
    }).length || 0;

  const awayGoals =
    goals?.filter((g: any) => {
      const player = matchPlayers?.find(
        (mp: any) => mp.player?.id === g.player?.id,
      );
      return Number(player?.team?.id) === Number(match.awayTeam?.id);
    }).length || 0;

  const handleSaveObservations = () => {
    updateVocalia.mutate({
      matchId,
      data: { observations },
    });
  };

  const isFinalized = match.status === "finalizado";

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Resumen y Finalización</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">
              Vocal Asignado
            </h4>
            <p>{vocalia.vocalUser?.user_name}</p>
            <p className="text-xs text-muted-foreground">
              {vocalia.vocalUser?.user_email}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">
              Estado
            </h4>
            <p className="capitalize">{match.status}</p>
          </div>
        </div>

        {/* COLLECTIONS SECTION */}
        <div className="border border-border rounded-md p-4 bg-row-alt">
          <h4 className="font-bold text-sm mb-3 text-text-muted uppercase">
            Montos Recolectados ($)
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-subtle">
                {match.localTeam?.name}
              </label>
              <Input
                type="number"
                leftIcon="$"
                placeholder="0.00"
                value={localAmount}
                onChange={(e) => setLocalAmount(e.target.value)}
                disabled={isFinalized}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-subtle">
                {match.awayTeam?.name}
              </label>
              <Input
                type="number"
                leftIcon="$"
                placeholder="0.00"
                value={awayAmount}
                onChange={(e) => setAwayAmount(e.target.value)}
                disabled={isFinalized}
              />
            </div>
          </div>
        </div>

        {/* GOALS SUMMARY */}
        <div className="border border-border rounded-md p-4 bg-row-alt">
          <h4 className="font-bold text-sm mb-3 text-text-muted uppercase">
            Resumen de Goles
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[match.localTeam, match.awayTeam].map((team) => {
              if (!team) return null;

              // Get goals for this team
              const teamGoals =
                goals?.filter((g: any) => {
                  const player = matchPlayers?.find(
                    (mp: any) => mp.player?.id === g.player?.id,
                  );
                  return Number(player?.team?.id) === Number(team.id);
                }) || [];

              // Group goals by player
              const goalsByPlayer = Object.values(
                teamGoals.reduce((acc: any, goal: any) => {
                  const playerId = goal.player?.id;
                  if (!acc[playerId]) {
                    acc[playerId] = {
                      player: goal.player,
                      count: 0,
                    };
                  }
                  acc[playerId].count++;
                  return acc;
                }, {}),
              );

              return (
                <div key={team.id}>
                  <h5 className="font-semibold text-text mb-1">{team.name}</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {goalsByPlayer.length > 0 ? (
                      (goalsByPlayer as any[]).map((entry: any) => (
                        <li key={entry.player.id} className="text-text-subtle">
                          {entry.player.name} {entry.player.lastname}{" "}
                          <span className="font-semibold text-text">
                            ({entry.count})
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-text-muted italic">Sin goles</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* SANCTIONS SUMMARY */}
        <div className="border border-border rounded-md p-4 bg-row-alt">
          <h4 className="font-bold text-sm mb-3 text-text-muted uppercase">
            Resumen de Sanciones
          </h4>
          <div className="flex flex-wrap gap-4">
            {sanctions?.length === 0 && (
              <p className="text-sm text-text-muted italic">
                No hay sanciones registradas.
              </p>
            )}
            {(() => {
              // Group sanctions by player
              const sanctionsByPlayer = Object.values(
                sanctions?.reduce((acc: any, s: any) => {
                  const playerId = s.player?.id;
                  if (!acc[playerId]) {
                    acc[playerId] = {
                      player: s.player,
                      yellow: 0,
                      red: 0,
                      teamName:
                        matchPlayers?.find(
                          (mp: any) => mp.player?.id === playerId,
                        )?.team?.name || "Equipo desconocido",
                    };
                  }
                  if (s.type === "amarilla") acc[playerId].yellow++;
                  if (s.type === "roja_directa") acc[playerId].red++;
                  return acc;
                }, {}) || {},
              );

              return (sanctionsByPlayer as any[]).map((entry: any) => (
                <div
                  key={entry.player.id}
                  className="flex items-center gap-2 text-sm bg-surface border border-border px-2 py-1.5 rounded-md"
                >
                  <span className="font-medium text-text">
                    {entry.player.name} {entry.player.lastname}
                  </span>
                  <span className="text-xs text-text-muted">
                    ({entry.teamName})
                  </span>
                  <div className="flex gap-1 ml-1">
                    {entry.yellow > 0 && (
                      <span className="flex items-center gap-0.5">
                        <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[1px] border border-yellow-500/50" />{" "}
                        <span className="text-xs font-mono">
                          x{entry.yellow}
                        </span>
                      </span>
                    )}
                    {entry.red > 0 && (
                      <span className="flex items-center gap-0.5">
                        <div className="w-2.5 h-3.5 bg-red-500 rounded-[1px] border border-red-600/50" />{" "}
                        <span className="text-xs font-mono">x{entry.red}</span>
                      </span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* ARBITRATOR & SIGNATURES SECTION */}
        <div className="border border-border rounded-md p-4 bg-row-alt space-y-4">
          <h4 className="font-bold text-sm text-text-muted uppercase">
            Firmas y Control
          </h4>

          <div className="space-y-2">
            <Input
              label="Nombre del Árbitro"
              type="text"
              placeholder="Nombre del árbitro principal"
              value={arbitratorName}
              onChange={(e) => setArbitratorName(e.target.value)}
              disabled={isFinalized}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <SignaturePad
              ref={localSigRef}
              label={`Firma Capitán ${match.localTeam?.name || "Local"}`}
              disabled={isFinalized}
              initialValue={vocalia.signatures?.local}
            />
            <SignaturePad
              ref={awaySigRef}
              label={`Firma Capitán ${match.awayTeam?.name || "Visitante"}`}
              disabled={isFinalized}
              initialValue={vocalia.signatures?.away}
            />
          </div>
        </div>

        {/* OBSERVATIONS SECTION */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-text-muted uppercase">
            Observaciones
          </h4>
          <div className="flex gap-2">
            <Textarea
              className="flex w-full"
              placeholder="Escribe observaciones del partido aquí..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
            <Button
              variant="secondary"
              className="h-auto shrink-0"
              onClick={handleSaveObservations}
              disabled={updateVocalia.isPending}
            >
              Guardar
            </Button>
          </div>
        </div>

        {isFinalized ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 flex gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <h5 className="font-medium mb-1">Partido Finalizado</h5>
              <p className="text-sm">
                {" "}
                Este partido ha sido finalizado y el acta cerrada. Ya no se
                pueden realizar modificaciones.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 flex gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <h5 className="font-medium mb-1">Acción Requerida</h5>
              <p className="text-sm">
                Revisa que todos los datos sean correctos antes de finalizar el
                partido. Una vez finalizado, se actualizarán las tablas y no se
                podrán hacer cambios.
              </p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!isFinalized && (
          <>
            <Button
              className="w-full"
              variant="danger"
              onClick={() => setIsConfirmOpen(true)}
              disabled={finalizeMatch.isPending}
            >
              {finalizeMatch.isPending
                ? "Finalizando..."
                : "Finalizar Partido y Cerrar Acta"}
            </Button>

            <ConfirmModal
              open={isConfirmOpen}
              onClose={() => setIsConfirmOpen(false)}
              onConfirm={() => {
                finalizeMatch.mutate({
                  matchId,
                  localScore: localGoals,
                  awayScore: awayGoals,
                  vocaliaData: {
                    localAmount,
                    awayAmount,
                  },
                  arbitratorName,
                  signatures: {
                    local: localSigRef.current?.getSignature() || undefined,
                    away: awaySigRef.current?.getSignature() || undefined,
                  },
                });
                setIsConfirmOpen(false);
              }}
              title="¿Finalizar Partido?"
              description="Esta acción es irreversible. Se actualizarán las estadísticas y la tabla de posiciones."
            />
          </>
        )}
        {isFinalized && (
          <div className="w-full flex justify-end">
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={() => {
                if (
                  confirm(
                    "¿Estás seguro de revertir la finalización del partido? Esto restará los puntos y goles de la tabla.",
                  )
                ) {
                  revertMatch.mutate(matchId);
                }
              }}
              disabled={revertMatch?.isPending}
            >
              {revertMatch?.isPending
                ? "Revirtiendo..."
                : "Revertir Finalización (Corrección)"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};
