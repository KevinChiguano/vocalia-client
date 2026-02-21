import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar,
  Filter,
  PlusCircle,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Repeat,
  Search,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { scheduleApi } from "../api/schedule.api";
import { useCategories } from "@/features/qualifications/api/category.hooks";
import { useTeams } from "@/features/qualifications/api/team.hooks";
import { useUsers } from "@/features/administration/hooks/useUsers";
import { useFields } from "../api/field.hooks";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { useUIStore } from "@/store/ui.store";
import * as XLSX from "xlsx";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

type ViewMode = "day" | "week" | "month";

interface Match {
  id: number;
  date: string;
  field?: { name: string };
  category?: { name: string };
  localTeam?: { name: string };
  awayTeam?: { name: string };
  vocal?: { name: string };
}

interface Props {
  tournaments?: any[];
  onCreate?: () => void;
  onRefresh?: () => void;
}

export const ScheduleManagementTab = ({
  tournaments = [],
  onCreate,
  onRefresh,
}: Props) => {
  const { setNotification } = useUIStore();
  // --- Global State ---
  const [tournamentId, setTournamentId] = useState<number>(0);
  const [stage, setStage] = useState("Fase de Grupos");

  // --- View & Filter State ---
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Data State ---
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Modal State ---
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isMassGenOpen, setIsMassGenOpen] = useState(false);

  // --- Form State ---
  const [categoryId, setCategoryId] = useState<number>(0);
  const [localTeamId, setLocalTeamId] = useState<number>(0);
  const [awayTeamId, setAwayTeamId] = useState<number>(0);
  const [vocalIds, setVocalIds] = useState<number[]>([]);
  const [fieldId, setFieldId] = useState<number>(0);
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");

  // --- Refs ---
  const tableRef = useRef<HTMLDivElement>(null);

  // --- Options Data ---
  const { data: categoriesData } = useCategories({ active: true });
  const categories = categoriesData?.data || [];

  const { data: teamsData } = useTeams({
    tournamentId: tournamentId || undefined,
  });
  const teams = teamsData?.data || [];

  const { usersQuery } = useUsers({ active: true });
  const vocals = useMemo(() => {
    return (usersQuery.data?.data || []).filter(
      (u: any) => u.roles?.name === "VOCAL" || Number(u.rolId) === 2,
    );
  }, [usersQuery.data]);

  const { data: fieldsData } = useFields();
  const fields = fieldsData || [];

  // --- Effects ---
  useEffect(() => {
    if (tournaments.length > 0 && !tournamentId) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments]);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId, currentDate, viewMode]);

  useEffect(() => {
    // Reset team selections when category changes
    setLocalTeamId(0);
    setAwayTeamId(0);
  }, [categoryId]);

  // --- Helpers ---
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewMode === "day") {
      // Start is beginning of day, end is end of day
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === "week") {
      // Start is Monday of current week
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);

      // End is Sunday
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (viewMode === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const fetchMatches = async () => {
    setLoading(true);
    const { start, end } = getDateRange();

    try {
      const result = await scheduleApi.getMatches({
        tournamentId: tournamentId || undefined,
        matchDateFrom: start.toISOString(),
        matchDateTo: end.toISOString(),
        limit: 100,
      });
      setMatches(result?.data?.items || result?.data || []);
    } catch (error) {
      console.error("Error fetching matches", error);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // --- Handlers ---
  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !tournamentId ||
      !localTeamId ||
      !awayTeamId ||
      !vocalIds[0] ||
      !fieldId
    ) {
      setNotification(
        "Atención",
        "Por favor completa los campos requeridos.",
        "error",
      );
      return;
    }

    try {
      // Create valid ISO string
      const matchDateTime = new Date(`${matchDate}T${matchTime}`);

      await scheduleApi.createMatch({
        tournamentId,
        stage,
        matchDate: matchDateTime.toISOString(), // Fix for Prisma Invalid value
        localTeamId,
        awayTeamId,
        categoryId: categoryId || undefined,
        vocalUserId: vocalIds[0] || undefined,
        fieldId: fieldId || undefined,
      });
      setNotification("Éxito", "Partido programado con éxito", "success");
      onRefresh?.();
    } catch (error) {
      console.error(error);
      setNotification("Error", "Error al programar el partido", "error");
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

  // --- Export Handlers ---
  const handleExportExcel = () => {
    if (matches.length === 0) return;

    const data = matches.map((m) => ({
      Fecha: new Date(m.date).toLocaleDateString(),
      Hora: new Date(m.date).toLocaleTimeString(),
      Cancha: m.field?.name || "Sin Sede",
      Categoría: m.category || "General",
      Local: m.localTeam?.name || "Local",
      Visita: m.awayTeam?.name || "Visita",
      Vocal: m.vocal?.name || "Sin Asignar",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Programación");
    XLSX.writeFile(
      wb,
      `programacion_${currentDate.toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handleExportPDF = async () => {
    if (!tableRef.current) return;

    try {
      const imgData = await toPng(tableRef.current, { quality: 0.95 });
      const pdf = new jsPDF("l", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`programacion_${currentDate.toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF", error);
    }
  };

  // --- Render Helpers ---
  const getPeriodLabel = () => {
    const { start, end } = getDateRange();
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
    };

    if (viewMode === "day") {
      return start.toLocaleDateString("es-ES", { ...options, weekday: "long" });
    } else if (viewMode === "month") {
      return start.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    } else {
      return `${start.toLocaleDateString("es-ES", options)} - ${end.toLocaleDateString("es-ES", options)}`;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "00:00";
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter teams based on category
  const filteredTeams = useMemo(() => {
    if (!categoryId) return teams;
    return teams.filter((t: any) => t.categoryId === categoryId);
  }, [teams, categoryId]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 font-sans">
      {/* Left Column: Form & Filters */}
      <div className="xl:col-span-4 space-y-6">
        {/* Filters Section */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-soft">
          <h3 className="text-text font-bold mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Filtros Globales
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Select
                label="Torneo"
                value={tournamentId}
                onChange={(e) => setTournamentId(Number(e.target.value))}
              >
                {tournaments.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Input
                label="Fase / Etapa"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                placeholder="Ej. Fase de Grupos"
              />
            </div>
          </div>
        </div>

        {/* Single Match Creation Form */}
        <div className="bg-surface p-6 rounded-xl border border-border shadow-xl">
          <h3 className="text-text font-bold mb-6 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-primary" />
            Programar Nuevo Partido
          </h3>
          <form className="space-y-4" onSubmit={handleCreateMatch}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Select
                  label="Categoría"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  label="Equipo 1 (Local)"
                  value={localTeamId}
                  onChange={(e) => setLocalTeamId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {filteredTeams.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  label="Equipo 2 (Visita)"
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {filteredTeams
                    .filter((t: any) => t.id !== localTeamId)
                    .map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </Select>
              </div>
              <div>
                <Select
                  label="Vocal Asignado"
                  value={vocalIds[0] || 0}
                  onChange={(e) => setVocalIds([Number(e.target.value)])}
                >
                  <option value={0}>Sin Asignar</option>
                  {vocals.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Select
                  label="Cancha"
                  value={fieldId}
                  onChange={(e) => setFieldId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {fields.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Input
                  label="Fecha"
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Hora Inicio"
                  type="time"
                  value={matchTime}
                  onChange={(e) => setMatchTime(e.target.value)}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full mt-4 gap-2 shadow-lg shadow-primary/20"
            >
              <PlusCircle className="w-5 h-5" />
              Confirmar Programación
            </Button>
          </form>
        </div>

        {/* Bulk Actions Tool */}
        <div className="bg-primary/10 p-6 rounded-xl border border-primary/20 relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-primary font-bold mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Generación Masiva
            </h3>
            <p className="text-text-muted text-sm mb-4">
              Programa múltiples fechas seleccionando un rango de días.
            </p>
            <button
              onClick={() => setIsMassGenOpen(true)}
              className="w-full py-2.5 border border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all text-sm"
            >
              Configurar Rango de Fechas
            </button>
          </div>
          <Repeat className="absolute -bottom-4 -right-4 w-24 h-24 text-primary/5 group-hover:scale-110 transition-transform" />
        </div>
      </div>

      {/* Right Column: Scheduled Matches List */}
      <div className="xl:col-span-8">
        <div
          className="bg-surface rounded-xl border border-border overflow-hidden flex flex-col h-full shadow-soft"
          ref={tableRef}
        >
          {/* Calendar Strip */}
          <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between bg-bg/50 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate("prev")}
                className="p-2 hover:bg-border rounded-full transition-colors text-text-muted"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-text font-bold capitalize text-center">
                  {getPeriodLabel()}
                </span>
                <span className="text-xs text-primary font-medium uppercase tracking-widest">
                  {viewMode === "day"
                    ? "Partidos del Día"
                    : viewMode === "week"
                      ? "Semana"
                      : "Mes"}
                </span>
              </div>
              <button
                onClick={() => navigateDate("next")}
                className="p-2 hover:bg-border rounded-full transition-colors text-text-muted"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("day")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === "day" ? "bg-primary text-white" : "bg-border text-text-muted hover:text-text"}`}
              >
                Día
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === "week" ? "bg-primary text-white" : "bg-border text-text-muted hover:text-text"}`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${viewMode === "month" ? "bg-primary text-white" : "bg-border text-text-muted hover:text-text"}`}
              >
                Mes
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-bg/50 text-text-muted text-xs font-bold uppercase tracking-wider">
            <div className="col-span-1">Hora</div>
            <div className="col-span-2">Cancha</div>
            <div className="col-span-2">Categoría</div>
            <div className="col-span-4">Enfrentamiento</div>
            <div className="col-span-2">Vocal</div>
            <div className="col-span-1 justify-self-end">Acciones</div>
          </div>

          {/* Table Body (Matches) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted animate-pulse">
                <p>Cargando partidos...</p>
              </div>
            ) : matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-muted">
                <Search className="w-12 h-12 mb-2 opacity-30" />
                <p>No hay partidos programados</p>
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 md:py-5 border-b border-border items-center hover:bg-bg/20 transition-colors group relative"
                >
                  <div className="col-span-1 flex items-center justify-between md:block">
                    <span className="md:hidden text-xs font-bold text-text-muted">
                      HORA:
                    </span>
                    <span className="text-text font-bold">
                      {formatTime(match.date)}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-text-muted hidden md:block" />
                    <span className="text-text-muted text-sm truncate">
                      {match.field?.name || "Sin Sede"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase truncate inline-block">
                      {match.category?.name || "General"}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="flex items-center gap-2 w-full text-left">
                      <span className="text-text font-medium text-sm">
                        {match.localTeam?.name || "Local"}
                      </span>
                      <span className="text-text-muted text-[10px]">vs</span>
                      <span className="text-text font-medium text-sm">
                        {match.awayTeam?.name || "Visita"}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-xs text-text">
                      {(match.vocal?.name || "S").charAt(0)}
                    </div>
                    <span className="text-text-muted text-sm truncate">
                      {match.vocal?.name || "Sin Asignar"}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button className="p-1.5 hover:bg-primary/20 hover:text-primary text-text-muted rounded transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(match.id)}
                      className="p-1.5 hover:bg-red-500/20 hover:text-red-500 text-text-muted rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-bg/50 border-t border-border flex flex-col sm:flex-row items-center justify-between text-text-muted text-sm gap-4">
            <div className="flex gap-4">
              <span>
                Programados: <b className="text-text">{matches.length}</b>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-text-muted">
                Exportar:
              </span>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 hover:text-text transition-colors"
              >
                <FileText className="w-4 h-4" /> PDF
              </button>
              <span className="text-text-muted">|</span>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1 hover:text-text transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteMatch}
        title="Eliminar Partido"
        description="¿Estás seguro de que deseas eliminar este partido?"
        danger
      />

      <Modal
        isOpen={isMassGenOpen}
        onClose={() => setIsMassGenOpen(false)}
        title="Generación Masiva de Partidos"
        maxWidth="md"
      >
        <p className="text-text-muted mb-6">
          Esta funcionalidad permitirá generar automáticamente los partidos para
          una fase, asignando sedes y árbitros según disponibilidad.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setIsMassGenOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={() => setIsMassGenOpen(false)}>Entendido</Button>
        </div>
      </Modal>
    </div>
  );
};
