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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { SchedulePrintTemplate } from "./SchedulePrintTemplate";
import logoDefault from "@/assets/logo_san_fernando.png";

type ViewMode = "day" | "week" | "month";

interface Match {
  id: number;
  date: string;
  field?: { id?: number; field_id?: number; name: string };
  category?: string;
  localTeam?: { id?: number; team_id?: number; name: string };
  awayTeam?: { id?: number; team_id?: number; name: string };
  vocal?: { id?: number; user_id?: number; name: string };
  stage?: string;
  matchDay?: number;
}

interface Props {
  tournaments?: any[];
  onRefresh?: () => void;
}

export const ScheduleManagementTab = ({
  tournaments = [],
  onRefresh,
}: Props) => {
  const { setNotification } = useUIStore();
  const [tournamentId, setTournamentId] = useState<number>(0);
  const [filterStage, setFilterStage] = useState("");
  const [filterMatchDay, setFilterMatchDay] = useState<number | "">("");

  // --- View & Filter State ---
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Data State ---
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Modal State ---
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isMassGenOpen, setIsMassGenOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | false>(
    false,
  );

  // --- Form State ---
  const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [localTeamId, setLocalTeamId] = useState<number>(0);
  const [awayTeamId, setAwayTeamId] = useState<number>(0);
  const [vocalIds, setVocalIds] = useState<number[]>([]);
  const [fieldId, setFieldId] = useState<number | string>(0);
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [formMatchDay, setFormMatchDay] = useState<number>(1);
  const [formStage, setFormStage] = useState("");

  // --- Refs ---
  const tableRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

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

  const getTeamLogo = (teamId?: number) => {
    if (!teamId) return null;
    const team = teams.find((t: any) => (t.id || t.team_id) === teamId);
    return team?.logo || null;
  };

  // --- Effects ---
  useEffect(() => {
    if (tournaments.length > 0 && !tournamentId) {
      setTournamentId(tournaments[0].id);
    }
  }, [tournaments]);

  useEffect(() => {
    fetchMatches();
  }, [tournamentId, currentDate, viewMode, filterMatchDay, filterStage]);

  useEffect(() => {
    // Reset team selections when category changes
    setLocalTeamId(0);
    setAwayTeamId(0);
  }, [categoryId]);

  // --- Helpers ---
  const daysForPrint = useMemo(() => {
    const datesMap = new Map<string, any[]>();

    matches.forEach((m) => {
      if (!m.date) return;
      const d = new Date(m.date);
      if (isNaN(d.getTime())) return;

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      const hh = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const timeStr = `${hh}:${mins}`;

      if (!datesMap.has(dateStr)) {
        datesMap.set(dateStr, []);
      }

      datesMap.get(dateStr)!.push({
        time: timeStr,
        localTeamId: m.localTeam?.id || m.localTeam?.team_id || 0,
        awayTeamId: m.awayTeam?.id || m.awayTeam?.team_id || 0,
        category: m.category || "General",
        vocalUserId: m.vocal?.id || m.vocal?.user_id || 0,
        fieldId: m.field?.id || m.field?.field_id || 0,
      });
    });

    return Array.from(datesMap.entries()).map(([date, dayMatches]) => ({
      id: `day-${date}`,
      date,
      matches: dayMatches,
    }));
  }, [matches]);

  const assignedVocalsSummaryForPrint = useMemo(() => {
    const counts = new Map<number, { count: number; name: string }>();
    matches.forEach((m) => {
      const vid = m.vocal?.id || m.vocal?.user_id;
      if (vid) {
        const vName = m.vocal?.name || "Vocal Desconocido";
        const current = counts.get(Number(vid)) || { count: 0, name: vName };
        counts.set(Number(vid), {
          count: current.count + 1,
          name: current.name,
        });
      }
    });
    return Array.from(counts.entries()).map(([userId, info]) => ({
      userId,
      count: info.count,
      userName: info.name,
    }));
  }, [matches]);

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
        matchDay: filterMatchDay || undefined,
        stage: filterStage || undefined,
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
  const resetForm = () => {
    setEditingMatchId(null);
    setCategoryId(0);
    setLocalTeamId(0);
    setAwayTeamId(0);
    setVocalIds([]);
    setFieldId(0);
    setMatchDate("");
    setMatchTime("");
    setFormMatchDay(1);
    setFormStage("");
  };

  const handleEditMatch = (match: Match) => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setEditingMatchId(match.id);
    setFormStage(match.stage || "Etapa Clasificatoria");
    setFormMatchDay(match.matchDay || 1);

    const cat = categories.find((c: any) => c.name === match.category);
    setCategoryId(cat ? Number(cat.id) : 0);

    setLocalTeamId(
      Number(match.localTeam?.id || match.localTeam?.team_id || 0),
    );
    setAwayTeamId(Number(match.awayTeam?.id || match.awayTeam?.team_id || 0));
    setFieldId(match.field?.id || match.field?.field_id || 0);
    setVocalIds(
      match.vocal?.id || match.vocal?.user_id
        ? [Number(match.vocal.id || match.vocal.user_id)]
        : [],
    );

    if (match.date) {
      const d = new Date(match.date);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        setMatchDate(`${yyyy}-${mm}-${dd}`);

        const hh = String(d.getHours()).padStart(2, "0");
        const mins = String(d.getMinutes()).padStart(2, "0");
        setMatchTime(`${hh}:${mins}`);
      }
    }
  };

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

      const categoryObj = categories.find(
        (c: any) => Number(c.id || c.category_id) === Number(categoryId),
      );

      const payload = {
        tournamentId,
        stage: formStage,
        matchDay: formMatchDay,
        matchDate: matchDateTime.toISOString(), // Fix for Prisma Invalid value
        localTeamId,
        awayTeamId,
        category: categoryObj ? categoryObj.name : undefined,
        vocalUserId:
          vocalIds[0] && Number(vocalIds[0]) > 0
            ? Number(vocalIds[0])
            : undefined,
        fieldId: fieldId && Number(fieldId) > 0 ? Number(fieldId) : undefined,
      };

      if (editingMatchId) {
        await scheduleApi.updateMatch(editingMatchId, payload);
        setNotification("Éxito", "Partido actualizado con éxito", "success");
      } else {
        await scheduleApi.createMatch(payload);
        setNotification("Éxito", "Partido programado con éxito", "success");
      }

      resetForm();
      onRefresh?.();
      fetchMatches();
    } catch (error: any) {
      console.error(error);
      const backendMsg =
        error.response?.data?.message || error.response?.data || error.message;
      setNotification(
        "Error",
        "Error al programar el partido: " + JSON.stringify(backendMsg),
        "error",
      );
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
  const handleExportExcel = async () => {
    if (matches.length === 0) return;

    try {
      setIsExporting("excel");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Programación", {
        views: [{ showGridLines: false }],
      });

      // 1. Prepare Logo Image
      // We need to fetch the logo as a base64 string or buffer
      let logoBase64 = "";
      try {
        const response = await fetch(logoDefault);
        const blob = await response.blob();
        logoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.warn("Could not load logo for Excel", err);
      }

      // Add image to workbook if successfully loaded
      if (logoBase64) {
        const imageId = workbook.addImage({
          base64: logoBase64,
          extension: "png",
        });

        // Add image to worksheet
        // tl: top-left cell, ext: dimensions in points or pixels
        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 80, height: 80 },
        });
      }

      // 2. Add Titles (Starting at Row 1, Column B (index 1) to leave room for the logo on the left)
      worksheet.mergeCells("B1:G1");
      const title1 = worksheet.getCell("B1");
      title1.value = "LIGA INDEPENDIENTE, SOCIAL Y CULTURAL";
      title1.font = { name: "Arial", bold: true, size: 16 };
      title1.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("B2:G2");
      const title2 = worksheet.getCell("B2");
      title2.value = '" SAN FERNANDO DE GUAMANI "';
      title2.font = {
        name: "Arial",
        italic: true,
        bold: true,
        size: 14,
        color: { argb: "FF333333" },
      };
      title2.alignment = { horizontal: "center", vertical: "middle" };

      worksheet.mergeCells("B3:G3");
      const title3 = worksheet.getCell("B3");
      title3.value = "HOJA DE PROGRAMACIÓN";
      title3.font = {
        name: "Arial",
        bold: true,
        size: 12,
        color: { argb: "FFCC0000" },
      };
      title3.alignment = { horizontal: "center", vertical: "middle" };

      // Set row heights for header area
      worksheet.getRow(1).height = 25;
      worksheet.getRow(2).height = 20;
      worksheet.getRow(3).height = 18;
      worksheet.getRow(4).height = 15; // padding row

      // 3. Define Table Header (Starts at Row 5)
      const headerRowIndex = 5;
      worksheet.getRow(headerRowIndex).values = [
        "Fecha",
        "Hora",
        "Cancha",
        "Categoría",
        "Local",
        "Visita",
        "Vocal",
      ];

      const headerRow = worksheet.getRow(headerRowIndex);
      headerRow.height = 20;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF003366" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // 4. Add Match Data
      let currentRowIndex = 6;
      matches.forEach((m) => {
        worksheet.getRow(currentRowIndex).values = [
          new Date(m.date).toLocaleDateString(),
          new Date(m.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          m.field?.name || "Sin Sede",
          m.category || "General",
          m.localTeam?.name || "Local",
          m.awayTeam?.name || "Visita",
          m.vocal?.name || "Sin Asignar",
        ];

        const row = worksheet.getRow(currentRowIndex);
        row.eachCell((cell) => {
          cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true,
          };
          cell.border = {
            top: { style: "thin", color: { argb: "FFCCCCCC" } },
            left: { style: "thin", color: { argb: "FFCCCCCC" } },
            bottom: { style: "thin", color: { argb: "FFCCCCCC" } },
            right: { style: "thin", color: { argb: "FFCCCCCC" } },
          };
        });
        currentRowIndex++;
      });

      // 5. Define Column Widths
      worksheet.columns = [
        { width: 14 }, // Fecha
        { width: 10 }, // Hora
        { width: 22 }, // Cancha
        { width: 18 }, // Categoría
        { width: 25 }, // Local
        { width: 25 }, // Visita
        { width: 22 }, // Vocal
      ];

      // Generate File
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `programacion_${currentDate.toISOString().split("T")[0]}.xlsx`,
      );
    } catch (error) {
      console.error("Error exporting Excel", error);
      setNotification("Error", "Ocurrió un error al generar el Excel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;

    setIsExporting("pdf");
    // Wait for the DOM to render the printable version
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const imgData = await toPng(printRef.current, {
        cacheBust: true,
        quality: 1,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(`programacion_${currentDate.toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF", error);
      setNotification("Error", "Error al exportar a PDF.", "error");
    } finally {
      setIsExporting(false);
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
          <div className="grid  md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 gap-4">
            <div className="lg:col-span-1">
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
            <div className="lg:col-span-1">
              <Input
                label="Fase / Etapa (Filtro)"
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                placeholder="Todas las fases"
              />
            </div>
            <div className="lg:col-span-1">
              <Input
                label="Jornada / Fecha (Filtro)"
                type="number"
                min={1}
                value={filterMatchDay}
                onChange={(e) =>
                  setFilterMatchDay(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
                placeholder="No filtrar"
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
              <div className="col-span-1">
                <Select
                  label="Categoría"
                  value={categoryId}
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {categories.map((c: any) => {
                    const cid = c.id || c.category_id;
                    return (
                      <option key={cid} value={cid}>
                        {c.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="col-span-1">
                <Input
                  label="Fase / Etapa"
                  value={formStage}
                  onChange={(e) => setFormStage(e.target.value)}
                  placeholder="Etapa Clasificatoria"
                  required
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Jornada / Fecha"
                  type="number"
                  min={1}
                  value={formMatchDay}
                  onChange={(e) => setFormMatchDay(Number(e.target.value))}
                  placeholder="1"
                  required
                />
              </div>
              <div className="col-span-1">
                <Select
                  label="Vocal Asignado"
                  value={vocalIds[0] || 0}
                  onChange={(e) => setVocalIds([Number(e.target.value)])}
                >
                  <option value={0}>Sin Asignar</option>
                  {vocals.map((v: any) => {
                    const vid = v.id || v.user_id;
                    return (
                      <option key={vid} value={vid}>
                        {v.user_name || v.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="col-span-1">
                <Select
                  label="Equipo 1 (Local)"
                  value={localTeamId}
                  onChange={(e) => setLocalTeamId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {filteredTeams.map((t: any) => {
                    const tid = t.id || t.team_id;
                    return (
                      <option key={tid} value={tid}>
                        {t.team_name || t.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="col-span-1">
                <Select
                  label="Equipo 2 (Visita)"
                  value={awayTeamId}
                  onChange={(e) => setAwayTeamId(Number(e.target.value))}
                >
                  <option value={0}>Seleccionar...</option>
                  {filteredTeams
                    .filter((t: any) => (t.id || t.team_id) !== localTeamId)
                    .map((t: any) => {
                      const tid = t.id || t.team_id;
                      return (
                        <option key={tid} value={tid}>
                          {t.team_name || t.name}
                        </option>
                      );
                    })}
                </Select>
              </div>

              <div className="col-span-1">
                <Select
                  label="Cancha"
                  value={fieldId}
                  onChange={(e) => setFieldId(e.target.value)}
                >
                  <option value={0}>Seleccionar...</option>
                  {fields.map((f: any) => {
                    const fid = f.id || f.field_id;
                    return (
                      <option key={fid} value={fid}>
                        {f.name}
                      </option>
                    );
                  })}
                </Select>
              </div>
              <div className="col-span-1">
                <Input
                  label="Fecha"
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Hora Inicio"
                  type="text"
                  placeholder="Ej: 14:30"
                  pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                  title="Formato de 24 horas (HH:MM)"
                  value={matchTime}
                  onChange={(e) => {
                    // Extraer solo dígitos
                    let raw = e.target.value.replace(/[^0-9]/g, "");
                    // Limitar a máximo 4 dígitos
                    raw = raw.slice(0, 4);

                    // Validar la hora (primeros 2 dígitos)
                    if (raw.length >= 2) {
                      const hours = parseInt(raw.slice(0, 2), 10);
                      if (hours > 23) {
                        // Si es mayor a 23, limitarlo a "23"
                        raw = "23" + raw.slice(2);
                      }
                    } else if (raw.length === 1 && parseInt(raw[0], 10) > 2) {
                      // Si el primer dígito es mayor a 2, asumimos que es 0X
                      raw = "0" + raw[0];
                    }

                    // Validar los minutos (siguientes 2 dígitos)
                    if (raw.length >= 4) {
                      const minutes = parseInt(raw.slice(2, 4), 10);
                      if (minutes > 59) {
                        // Si es mayor a 59, limitarlo a "59"
                        raw = raw.slice(0, 2) + "59";
                      }
                    } else if (raw.length === 3 && parseInt(raw[2], 10) > 5) {
                      // Si el primer dígito de los minutos es > 5
                      raw = raw.slice(0, 2) + "0" + raw[2];
                    }

                    // Formatear añadiendo los dos puntos automáticamente
                    let formatted = raw;
                    if (raw.length >= 3) {
                      formatted = raw.slice(0, 2) + ":" + raw.slice(2);
                    }

                    setMatchTime(formatted);
                  }}
                  required
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                type="submit"
                className="w-full gap-2 shadow-lg shadow-primary/20"
              >
                {editingMatchId ? (
                  <Edit className="w-5 h-5" />
                ) : (
                  <PlusCircle className="w-5 h-5" />
                )}
                {editingMatchId
                  ? "Actualizar Partido"
                  : "Confirmar Programación"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={resetForm}
                className="w-full"
              >
                {editingMatchId ? "Cancelar" : "Limpiar"}
              </Button>
            </div>
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
            <div className="col-span-4 justify-self-center">Enfrentamiento</div>
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
                  className="md:border-b md:border-border transition-colors group relative pt-4 md:pt-0 pb-2 md:pb-0"
                >
                  {/* Desktop View */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 items-center md:hover:bg-bg/20">
                    <div className="col-span-1">
                      <span className="text-text font-bold">
                        {formatTime(match.date)}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-text-muted" />
                      <span className="text-text-muted text-sm truncate">
                        {match.field?.name || "Sin Sede"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase truncate inline-block">
                        {match.category || "General"}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex items-center justify-end gap-2 flex-1">
                        <span className="text-text font-medium text-sm truncate max-w-[120px]">
                          {match.localTeam?.name || "Local"}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {getTeamLogo(
                            match.localTeam?.id || match.localTeam?.team_id,
                          ) ? (
                            <img
                              src={
                                getTeamLogo(
                                  match.localTeam?.id ||
                                    match.localTeam?.team_id,
                                )!
                              }
                              alt="Local"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-text-muted">
                              {(match.localTeam?.name || "L")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-text-muted text-[10px] font-bold uppercase tracking-widest px-1">
                        vs
                      </span>
                      <div className="flex items-center justify-start gap-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {getTeamLogo(
                            match.awayTeam?.id || match.awayTeam?.team_id,
                          ) ? (
                            <img
                              src={
                                getTeamLogo(
                                  match.awayTeam?.id || match.awayTeam?.team_id,
                                )!
                              }
                              alt="Visita"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-text-muted">
                              {(match.awayTeam?.name || "V")
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <span className="text-text font-medium text-sm truncate max-w-[120px]">
                          {match.awayTeam?.name || "Visita"}
                        </span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden flex items-center justify-center text-xs font-bold uppercase">
                        {(match.vocal?.name || "S").charAt(0)}
                      </div>
                      <span className="text-text-muted text-sm truncate">
                        {match.vocal?.name || "Sin Asignar"}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleEditMatch(match)}
                        className="p-1.5 hover:bg-primary/20 hover:text-primary text-text-muted rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(match.id)}
                        className="p-1.5 hover:bg-danger/20 hover:text-danger text-text-muted rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden bg-surface rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 overflow-hidden relative mx-4 mt-2">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1">
                            {match.category || "General"}
                          </p>
                          <h3 className="text-sm font-semibold text-text">
                            {match.stage || "Partido"}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex flex-col items-center gap-2 flex-1 relative z-10">
                          {getTeamLogo(
                            match.localTeam?.id || match.localTeam?.team_id,
                          ) ? (
                            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={
                                  getTeamLogo(
                                    match.localTeam?.id ||
                                      match.localTeam?.team_id,
                                  )!
                                }
                                alt="Local"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center border-2 border-primary/20 text-xs font-bold text-text uppercase shadow-inner">
                              {match.localTeam?.name
                                ? match.localTeam.name.substring(0, 2)
                                : "L"}
                            </div>
                          )}
                          <span className="text-xs font-medium text-center">
                            {match.localTeam?.name || "Local"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-1 shrink-0 px-2 relative z-0">
                          <span className="text-lg font-black text-text-muted italic tracking-widest opacity-80">
                            VS
                          </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-1 relative z-10">
                          {getTeamLogo(
                            match.awayTeam?.id || match.awayTeam?.team_id,
                          ) ? (
                            <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={
                                  getTeamLogo(
                                    match.awayTeam?.id ||
                                      match.awayTeam?.team_id,
                                  )!
                                }
                                alt="Visita"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center border-2 border-primary/20 text-xs font-bold text-text uppercase shadow-inner">
                              {match.awayTeam?.name
                                ? match.awayTeam.name.substring(0, 2)
                                : "V"}
                            </div>
                          )}
                          <span className="text-xs font-medium text-center">
                            {match.awayTeam?.name || "Visita"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 border-t border-border pt-3">
                        <div className="flex items-center text-xs text-text-muted gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{match.field?.name || "Sin Sede"}</span>
                        </div>
                        <div className="flex items-center text-xs text-text-muted gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>
                            {new Date(match.date).toLocaleDateString("es-ES")} -{" "}
                            {formatTime(match.date)}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-text-muted gap-2">
                          <div className="w-4 h-4 rounded-full bg-primary/10 text-primary border border-primary/20 overflow-hidden flex items-center justify-center text-[8px] font-bold uppercase shrink-0">
                            {(match.vocal?.name || "S").charAt(0)}
                          </div>
                          <span className="truncate">
                            Vocal:{" "}
                            <span className="font-medium text-text">
                              {match.vocal?.name || "Sin Asignar"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-bg/50 px-4 py-2 flex justify-between items-center border-t border-border">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEditMatch(match)}
                          className="flex items-center gap-1 text-text-muted hover:text-primary transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-xs font-medium">Editar</span>
                        </button>
                        <button
                          onClick={() => setDeleteId(match.id)}
                          className="flex items-center gap-1 text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-medium">Eliminar</span>
                        </button>
                      </div>
                    </div>
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

      {isExporting && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-lg">
              {isExporting === "excel"
                ? "Generando Excel..."
                : "Generando PDF..."}
            </p>
            <p className="text-sm text-text-muted">
              Por favor espera un momento
            </p>
          </div>
        </div>
      )}

      {/* Hidden Print Template */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef}>
          <SchedulePrintTemplate
            logoUrl={logoDefault}
            title1="LIGA INDEPENDIENTE, SOCIAL Y CULTURAL"
            title2='" SAN FERNANDO DE GUAMANI "'
            title3="HOJA DE PROGRAMACIÓN"
            fecha={Number(filterMatchDay) || 1}
            vuelta={1}
            days={daysForPrint}
            teams={teams}
            categories={categories}
            vocals={vocals}
            fields={fields}
            assignedVocalsSummary={assignedVocalsSummaryForPrint}
          />
        </div>
      </div>
    </div>
  );
};
