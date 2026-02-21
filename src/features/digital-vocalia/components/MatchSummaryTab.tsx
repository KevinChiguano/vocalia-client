import {
  useVocaliasMutations,
  useMatchGoals,
  useMatchSanctions,
  useMatchPlayers,
} from "../hooks/useVocalias";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  FileText,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Trophy,
  AlertCircle,
  CheckCircle2,
  PenTool,
  Save,
  Undo,
  X,
  Download,
} from "lucide-react";
import { exportMatchPDF } from "../utils/exportMatchPDF";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState, useEffect, useRef } from "react";
import { SignaturePad, SignaturePadRef } from "@/components/ui/SignaturePad";
import { useQuery } from "@tanstack/react-query";
import { scheduleApi } from "@/features/technical-commission/api/schedule.api";

interface MatchSummaryTabProps {
  vocalia: any;
}

export const MatchSummaryTab = ({ vocalia }: MatchSummaryTabProps) => {
  const match = vocalia.match;
  const matchId = Number(match.match_id);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRevertConfirmOpen, setIsRevertConfirmOpen] = useState(false);

  // Fetch full match details to ensure we have the time
  const { data: fullMatch } = useQuery({
    queryKey: ["match-details", matchId],
    queryFn: () => scheduleApi.getMatchById(matchId),
    enabled: !!matchId,
  });

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

  // Group goals by player
  const groupedGoals = goals?.reduce((acc: any, goal: any) => {
    const playerId = goal.player?.id;
    if (!acc[playerId]) {
      const matchPlayer = matchPlayers?.find(
        (mp: any) => mp.player?.id === playerId,
      );
      // Try to get dorsal from matchPlayer (roster) first, then player profile
      const mp = matchPlayer as any;
      const dorsal =
        mp?.player?.number ||
        mp?.number ||
        goal.player?.number ||
        goal.player?.dorsal;

      acc[playerId] = {
        player: goal.player,
        teamId: matchPlayer?.team?.id,
        dorsal: dorsal,
        count: 0,
      };
    }
    acc[playerId].count += 1;
    return acc;
  }, {});

  const goalsList = Object.values(groupedGoals || {});

  // Group sanctions by player
  const groupedSanctions = sanctions?.reduce((acc: any, sanction: any) => {
    const playerId = sanction.player?.id;
    if (!acc[playerId]) {
      const matchPlayer = matchPlayers?.find(
        (mp: any) => mp.player?.id === playerId,
      );
      // Try to get dorsal from matchPlayer (roster) first, then player profile
      const mp = matchPlayer as any;
      const dorsal =
        mp?.player?.number ||
        mp?.number ||
        sanction.player?.number ||
        sanction.player?.dorsal;

      acc[playerId] = {
        player: sanction.player,
        teamId: matchPlayer?.team?.id,
        dorsal: dorsal,
        yellow: 0,
        red: 0,
      };
    }
    if (sanction.type === "amarilla") acc[playerId].yellow += 1;
    if (
      sanction.type === "roja_directa" ||
      sanction.type === "roja_doble_amarilla"
    )
      acc[playerId].red += 1;
    return acc;
  }, {});

  const sanctionsList = Object.values(groupedSanctions || {});

  // Identify correct match time
  const matchTime =
    fullMatch?.time ||
    fullMatch?.match?.time || // Check nested match object
    fullMatch?.match_time ||
    match.time ||
    match.match_time ||
    match.matchTime ||
    vocalia.match?.time ||
    vocalia.match?.match_time ||
    (match.date
      ? new Date(match.date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--:--");

  return (
    <div className="flex flex-col h-full bg-bg min-h-screen font-sans">
      {/* Top Header */}
      <header
        id="summary-header"
        className="flex items-center justify-between border-b border-border bg-surface px-6 py-4 sticky top-0 z-30 isolate backdrop-blur-md"
      >
        <div className="flex items-center gap-4">
          <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm border border-primary/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-tight tracking-tight text-text">
              Acta Oficial de Partido
            </h2>
            <p className="text-xs text-primary font-medium uppercase tracking-widest">
              ID: #{match.match_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 ${
              isFinalized
                ? "bg-green-500/10 text-green-600 border-green-500/20"
                : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
            }`}
          >
            {isFinalized ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Finalizado
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" /> En Curso
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-4 md:px-8 space-y-8 animate-in fade-in duration-500">
        {/* Match Meta Info */}
        <div
          id="summary-info"
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-text">
              Resumen y Acta
            </h1>
            <p className="text-text-muted mt-2 flex items-center gap-3 text-sm flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-text-subtle" />
                {new Date(match.date).toLocaleDateString()}
              </span>
              <span className="hidden md:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-text-subtle" />
                {match.location || "Sede Principal"}
              </span>
              <span className="hidden md:inline text-border">•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-text-subtle" />
                {matchTime}
              </span>
            </p>
          </div>
        </div>

        {/* 1. Financial Summary */}
        <section id="summary-financial">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary font-bold font-mono">01.</span>
            <h2 className="text-xl font-bold text-text">Resumen Financiero</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Local Team Finance */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-soft transition-all hover:border-primary/20 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Equipo A (Local)
                  </p>
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {match.localTeam?.name}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="text-4xl! font-black text-primary border-none bg-transparent p-4 h-auto focus:ring-0 placeholder:text-gray-200/50 w-full text-center shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={localAmount}
                  onChange={(e) => setLocalAmount(e.target.value)}
                  disabled={isFinalized}
                />
              </div>
              <p className="text-xs text-text-subtle mt-4 italic border-t border-border pt-4 text-center">
                Arbitraje + Inscripción
              </p>
            </div>

            {/* Away Team Finance */}
            <div className="bg-surface p-6 rounded-xl border border-border shadow-soft transition-all hover:border-primary/20 group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
                    Equipo B (Visitante)
                  </p>
                  <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                    {match.awayTeam?.name}
                  </h3>
                </div>
                <div className="p-2 rounded-lg bg-primary/5 text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-2 relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="text-4xl! font-black text-primary border-none bg-transparent p-4 h-auto focus:ring-0 placeholder:text-gray-200/50 w-full text-center shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={awayAmount}
                  onChange={(e) => setAwayAmount(e.target.value)}
                  disabled={isFinalized}
                />
              </div>
              <p className="text-xs text-text-subtle mt-4 italic border-t border-border pt-4 text-center">
                Arbitraje + Inscripción
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 2. Goals Summary */}
          <section id="summary-goals" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold font-mono">02.</span>
              <h2 className="text-xl font-bold text-text">Resumen de Goles</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
              <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-xs uppercase font-bold text-text-muted border-b border-primary/10">
                  <tr>
                    <th className="px-5 py-3.5">Jugador</th>
                    <th className="px-5 py-3.5 text-center">Goles</th>
                    <th className="px-5 py-3.5 text-right flex items-center justify-end gap-1">
                      <Trophy className="w-3 h-3" /> Equipo
                    </th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border">
                  {goalsList && goalsList.length > 0 ? (
                    goalsList.map((item: any, index: number) => {
                      const isLocal =
                        Number(item.teamId) === Number(match.localTeam?.id);

                      return (
                        <tr
                          key={index}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-5 py-3 font-medium text-text">
                            <span className="font-bold">
                              {item.player?.name} {item.player?.lastname}
                            </span>
                            {item.dorsal && (
                              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded-md bg-surface text-text-muted border border-gray-200 font-mono font-bold">
                                #{item.dorsal}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-center font-black text-lg text-primary">
                            {item.count}
                          </td>
                          <td
                            className={`px-5 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isLocal ? "text-primary" : "text-text-muted"
                            }`}
                          >
                            {isLocal
                              ? match.localTeam?.name
                              : match.awayTeam?.name}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-text-muted italic flex flex-col items-center gap-2"
                      >
                        <Trophy className="w-8 h-8 opacity-20" />
                        No se registraron goles
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Sanctions Summary */}
          <section id="summary-sanctions" className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-primary font-bold font-mono">03.</span>
              <h2 className="text-xl font-bold text-text">Sanciones</h2>
            </div>
            <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
              <table className="w-full text-left border-collapse">
                <thead className="bg-primary/5 text-xs uppercase font-bold text-text-muted border-b border-primary/10">
                  <tr>
                    <th className="px-5 py-3.5 w-24 text-center">Tarjetas</th>
                    <th className="px-5 py-3.5">Jugador</th>
                    <th className="px-5 py-3.5 text-right">Equipo</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border">
                  {sanctionsList && sanctionsList.length > 0 ? (
                    sanctionsList.map((item: any, index: number) => {
                      const isLocal =
                        Number(item.teamId) === Number(match.localTeam?.id);

                      return (
                        <tr
                          key={index}
                          className="hover:bg-primary/5 transition-colors"
                        >
                          <td className="px-5 py-3 flex justify-center gap-2">
                            {item.yellow > 0 && (
                              <div
                                className="w-5 h-7 bg-yellow-400 rounded-[2px] shadow-sm flex items-center justify-center text-[10px] font-bold text-yellow-900"
                                title={`${item.yellow} Tarjeta(s) Amarilla(s)`}
                              >
                                {item.yellow > 1 ? item.yellow : ""}
                              </div>
                            )}
                            {item.red > 0 && (
                              <div
                                className="w-5 h-7 bg-red-500 rounded-[2px] shadow-sm flex items-center justify-center text-[10px] font-bold text-white"
                                title={`${item.red} Tarjeta(s) Roja(s)`}
                              >
                                {item.red > 1 ? item.red : ""}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-medium text-text">
                            <span className="font-bold">
                              {item.player?.name} {item.player?.lastname}
                            </span>
                            {item.dorsal && (
                              <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded-md bg-surface text-text-muted border border-border font-mono font-bold">
                                #{item.dorsal}
                              </span>
                            )}
                          </td>
                          <td
                            className={`px-5 py-3 text-right text-xs font-bold uppercase tracking-wider ${
                              isLocal ? "text-primary" : "text-text-muted"
                            }`}
                          >
                            {isLocal
                              ? match.localTeam?.name
                              : match.awayTeam?.name}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-8 text-center text-text-muted italic flex flex-col items-center gap-2"
                      >
                        <CheckCircle2 className="w-8 h-8 opacity-20" />
                        Juego limpio (Sin sanciones)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 4. Signatures & Control */}
        <section id="summary-signatures" className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-mono">04.</span>
            <h2 className="text-xl font-bold text-text">Firmas y Control</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Referee */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-soft h-full flex flex-col justify-center">
              <label className="text-xs font-bold uppercase text-text-muted mb-3 flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5" /> Árbitro Principal
              </label>
              <Input
                className="w-full bg-primary/5 border-primary/20 rounded-lg text-sm font-semibold focus:ring-primary focus:border-primary mb-4"
                placeholder="Nombre del Árbitro"
                value={arbitratorName}
                onChange={(e) => setArbitratorName(e.target.value)}
                disabled={isFinalized}
              />
              <p className="text-[10px] text-center mt-3 text-text-muted font-mono bg-bg/50 py-1 rounded">
                LICENCIA: #REF-{matchId}
              </p>
            </div>

            {/* Local Captain */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-soft">
              <label className="text-xs font-bold uppercase text-text-muted mb-3 flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5" /> Capitán{" "}
                {match.localTeam?.name}
              </label>

              <div className="border border-dashed border-primary/30 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                <SignaturePad
                  ref={localSigRef}
                  label="Firma aquí"
                  disabled={isFinalized}
                  initialValue={vocalia.signatures?.local}
                  height={150}
                  className="w-full"
                />
              </div>
              <p className="text-[10px] text-center mt-3 text-text-muted">
                Doy fe de la veracidad de los datos
              </p>
            </div>

            {/* Away Captain */}
            <div className="bg-surface p-5 rounded-xl border border-border shadow-soft">
              <label className="text-xs font-bold uppercase text-text-muted mb-3 flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5" /> Capitán{" "}
                {match.awayTeam?.name}
              </label>

              <div className="border border-dashed border-primary/30 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                <SignaturePad
                  ref={awaySigRef}
                  label="Firma aquí"
                  disabled={isFinalized}
                  initialValue={vocalia.signatures?.away}
                  height={150}
                  className="w-full"
                />
              </div>
              <p className="text-[10px] text-center mt-3 text-text-muted">
                Doy fe de la veracidad de los datos
              </p>
            </div>
          </div>
        </section>

        {/* 5. Observations */}
        <section id="summary-observations" className="space-y-4 pb-24">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold font-mono">05.</span>
            <h2 className="text-xl font-bold text-text">
              Observaciones Oficiales
            </h2>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-soft relative group">
            <Textarea
              className="w-full bg-primary/5 border-none focus:ring-0 rounded-lg text-sm italic text-text placeholder:text-text-muted resize-none min-h-[120px]"
              placeholder="Ingrese notas del partido, incidentes o reportes adicionales..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              disabled={isFinalized}
            />
            {!isFinalized && (
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSaveObservations}
                  disabled={updateVocalia.isPending}
                  className="shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateVocalia.isPending ? "Guardando..." : "Guardar Notas"}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Bottom Control Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border px-6 py-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div
            className={`size-2.5 rounded-full ${
              isFinalized ? "bg-green-500" : "bg-yellow-500 animate-pulse"
            }`}
          ></div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-widest hidden md:block">
            Estado del Documento:{" "}
            {isFinalized ? (
              <span className="text-green-600 dark:text-green-400">
                100% Verificado
              </span>
            ) : (
              <span className="text-yellow-600 dark:text-yellow-400">
                En Edición
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-4">
          {!isFinalized ? (
            <>
              <Button
                variant="ghost"
                className="text-text-muted hover:text-primary transition-colors font-bold text-sm hidden sm:flex"
                onClick={() => window.history.back()}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                className="px-6 py-2 rounded-lg bg-primary text-white font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                onClick={() => setIsConfirmOpen(true)}
                disabled={finalizeMatch.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {finalizeMatch.isPending ? "FINALIZANDO..." : "CERRAR ACTA"}
              </Button>
              <ConfirmModal
                open={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                  finalizeMatch.mutate(
                    {
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
                    },
                    {
                      onSuccess: () => {
                        exportMatchPDF(matchId);
                      },
                    },
                  );
                  setIsConfirmOpen(false);
                }}
                title="¿Finalizar Partido?"
                description="Esta acción es irreversible. Se actualizarán las estadísticas y la tabla de posiciones."
              />
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="text-primary border-primary/20 hover:bg-primary/5"
                onClick={() => exportMatchPDF(matchId)}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setIsRevertConfirmOpen(true)}
                disabled={revertMatch?.isPending}
              >
                <Undo className="w-4 h-4 mr-2" />
                Revertir
              </Button>
              <ConfirmModal
                open={isRevertConfirmOpen}
                onClose={() => setIsRevertConfirmOpen(false)}
                onConfirm={() => {
                  revertMatch.mutate(matchId);
                  setIsRevertConfirmOpen(false);
                }}
                title="¿Revertir Finalización?"
                description="¿Estás seguro de revertir la finalización? Esto afectará la tabla de posiciones y devolverá el partido a estado 'en_curso'."
                danger
              />
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
