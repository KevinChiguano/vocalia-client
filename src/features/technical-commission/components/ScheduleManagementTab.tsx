import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Calendar,
  Trash2,
  Edit2,
  AlertCircle,
  Filter,
  X,
} from "lucide-react";
import { scheduleApi } from "../api/schedule.api";
import { useTournaments } from "@/features/administration/hooks/useTournaments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Select } from "@/components/ui/Select";

interface Props {
  onEdit?: (match: any) => void;
}

export const ScheduleManagementTab = ({ onEdit }: Props) => {
  const [tournamentId, setTournamentId] = useState<number>(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [matchDateFrom, setMatchDateFrom] = useState("");
  const [matchDateTo, setMatchDateTo] = useState("");
  const [stageInput, setStageInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Data fetching
  const { data: tournamentsData } = useTournaments({});
  const tournaments = tournamentsData?.data || [];

  const fetchMatches = async () => {
    if (!tournamentId) return;
    setLoading(true);
    try {
      const result = await scheduleApi.getMatches({
        tournamentId,
        matchDateFrom: matchDateFrom || undefined,
        matchDateTo: matchDateTo || undefined,
        stage: stageInput || undefined,
        limit: 100, // Fetch a good amount for the view
      });
      // result might be { data, meta } or just the array depending on backend response format
      setMatches(result?.data?.items || result?.data || []);
    } catch (error) {
      console.error("Error fetching matches", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchMatches();
    } else {
      setMatches([]);
    }
  }, [tournamentId]);

  const handleApplyFilters = () => {
    fetchMatches();
  };

  const handleClearFilters = () => {
    setMatchDateFrom("");
    setMatchDateTo("");
    setStageInput("");
    setStatusFilter("");
    // Re-fetch without filters if tournament is selected
    if (tournamentId) {
      setTimeout(fetchMatches, 0);
    }
  };

  const handleDeleteMatch = async () => {
    if (deleteId) {
      try {
        await scheduleApi.deleteMatch(deleteId);
        setDeleteId(null);
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match", error);
      }
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "00:00";
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface p-4 rounded-xl shadow-soft border border-border">
        <div className="md:col-span-2">
          <label className="ui-label block mb-1">Seleccionar Torneo</label>
          <Select
            value={tournamentId}
            onChange={(e) => setTournamentId(parseInt(e.target.value))}
          >
            <option value={0}>Elegir para Gestionar...</option>
            {tournaments.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="ui-label block mb-1">Desde</label>
          <input
            type="date"
            className="ui-input w-full"
            value={matchDateFrom}
            onChange={(e) => setMatchDateFrom(e.target.value)}
          />
        </div>

        <div>
          <label className="ui-label block mb-1">Hasta</label>
          <input
            type="date"
            className="ui-input w-full"
            value={matchDateTo}
            onChange={(e) => setMatchDateTo(e.target.value)}
          />
        </div>
      </div>

      {tournamentId > 0 && (
        <>
          <FiltersBar
            left={
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Input
                    placeholder="Filtrar por Etapa..."
                    value={stageInput}
                    onChange={(e) => setStageInput(e.target.value)}
                    className="w-48 pr-10"
                  />
                  {stageInput && (
                    <button
                      onClick={() => setStageInput("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <Button onClick={handleApplyFilters} className="gap-2">
                  <Search className="w-4 h-4" />
                  <span>Filtrar</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="bg-surface"
                >
                  Limpiar
                </Button>
              </div>
            }
          />

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : matches.length > 0 ? (
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-soft">
              <table className="w-full border-collapse">
                <thead className="bg-bg border-b border-border">
                  <tr className="[&_th]:p-4 [&_th]:text-left [&_th]:font-black [&_th]:uppercase [&_th]:tracking-widest [&_th]:text-[10px] [&_th]:text-text-muted">
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Encuentro</th>
                    <th>Cancha</th>
                    <th>Etapa</th>
                    <th>Vocal</th>
                    <th>Estado</th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {matches.map((m) => (
                    <tr key={m.id} className="hover:bg-elevated/30">
                      <td className="p-4 text-sm font-medium">
                        {formatDate(m.date)}
                      </td>
                      <td className="p-4 text-sm font-bold text-primary">
                        {formatTime(m.date)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span className="truncate max-w-[120px]">
                            {m.localTeam?.name || "TBD"}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            VS
                          </span>
                          <span className="truncate max-w-[120px]">
                            {m.awayTeam?.name || "TBD"}
                          </span>
                        </div>
                        <div className="text-[10px] text-text-subtle uppercase tracking-tighter">
                          {m.category}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-primary/80">
                          {m.field?.name || "TBD"}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-medium text-text-muted uppercase italic">
                        {m.stage}
                      </td>
                      <td className="p-4">
                        {m.vocal ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-bold">
                              {m.vocal.name}
                            </span>
                            <span className="text-[10px] text-text-subtle">
                              Vocal Asignado
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-danger font-medium italic">
                            Sin vocal
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-bold">
                        <span
                          className={`px-2 py-1 rounded-full uppercase tracking-tighter ${
                            m.status === "finalizado"
                              ? "bg-success/10 text-success"
                              : m.status === "programado"
                                ? "bg-primary/10 text-primary"
                                : "bg-text-muted/10 text-text-muted"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEdit?.(m)}
                            className="p-2 text-text-muted hover:text-primary hover:bg-primary/5 rounded-lg"
                            title="Editar Match"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(m.id)}
                            className="p-2 text-text-muted hover:text-danger hover:bg-danger/5 rounded-lg"
                            title="Eliminar Match"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-bg border-2 border-dashed border-border rounded-3xl text-text-muted">
              <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
              <p className="type-h3 font-bold">
                No se encontraron encuentros programados
              </p>
              <p className="text-sm">
                Asegúrate de seleccionar un torneo o ajustar los filtros
              </p>
            </div>
          )}
        </>
      )}

      {!tournamentId && (
        <div className="flex flex-col items-center justify-center p-20 bg-bg border-2 border-dashed border-border rounded-3xl text-text-muted">
          <Calendar className="w-16 h-16 mb-4 opacity-20" />
          <p className="type-h3 font-bold">
            Selecciona un torneo para gestionar su programación
          </p>
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteMatch}
        title="Eliminar Partido"
        description="¿Estás seguro de que deseas eliminar este partido programado? Esta acción no se puede deshacer."
        danger
      />
    </div>
  );
};
