import { useState, useMemo, useRef, useEffect } from "react";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { Save, Plus, AlertCircle } from "lucide-react";

import { ScheduleHeader } from "./ScheduleHeader";
import { ScheduleMetadata } from "./ScheduleMetadata";
import { ScheduleDaySection } from "./ScheduleDaySection";
import { ScheduleVocalsSummary } from "./ScheduleVocalsSummary";
import { SchedulePrintTemplate } from "./SchedulePrintTemplate";
import { Button } from "@/components/ui/Button";
import { useFields } from "../api/field.hooks";
import logoDefault from "@/assets/logo_san_fernando.png";

import { scheduleApi } from "../api/schedule.api";
import { useTournaments } from "@/features/administration/hooks/useTournaments";
import { useTeams } from "@/features/qualifications/api/team.hooks";
import { useCategories } from "@/features/qualifications/api/category.hooks";
import { useUsers } from "@/features/administration/hooks/useUsers";

import { Select } from "@/components/ui/Select";

interface Props {
  editingMatch?: any;
  onCancelEdit?: () => void;
}

export const ScheduleTab = ({ editingMatch, onCancelEdit }: Props) => {
  const [tournamentId, setTournamentId] = useState<number>(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [fecha, setFecha] = useState(1);
  const [vuelta, setVuelta] = useState(1);
  const [stage, setStage] = useState("Etapa Clasificatoria");

  const [days, setDays] = useState<any[]>([
    {
      id: "day-1",
      date: new Date().toISOString().split("T")[0],
      matches: [],
    },
  ]);

  // Header State
  const [logoUrl, setLogoUrl] = useState<string>(logoDefault);
  const [title1, setTitle1] = useState("LIGA INDEPENDIENTE, SOCIAL Y CULTURAL");
  const [title2, setTitle2] = useState('" SAN FERNANDO DE GUAMANI "');
  const [title3, setTitle3] = useState("HOJA DE PROGRAMACIÓN");
  const [isExporting, setIsExporting] = useState(false);

  const sheetRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Data fetching (Hooks)
  const { data: tournamentsData } = useTournaments({});
  const tournaments = tournamentsData?.data || [];

  const { data: categoriesData } = useCategories({ active: true });
  const allCategories = categoriesData?.data || [];

  const { data: teamsData } = useTeams({ tournamentId });
  const allTeams = teamsData?.data || [];

  // Fetching Vocales (Backend returns { items: [], pagination: {} })
  // useUsers hook should return mapped PaginatedResponse { data, meta }
  const { usersQuery } = useUsers({ active: true });
  const vocals = useMemo(() => {
    return (usersQuery.data?.data || []).filter(
      (u: any) => u.roles?.name === "VOCAL" || Number(u.rolId) === 2,
    );
  }, [usersQuery.data]);

  // Edit Mode Effect
  useEffect(() => {
    if (editingMatch) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      const matchDate = new Date(editingMatch.date);
      if (isNaN(matchDate.getTime())) {
        console.error("Invalid date received:", editingMatch.date);
        return;
      }

      setTournamentId(Number(editingMatch.tournament?.id || 0));
      setStage(editingMatch.stage || "Etapa Clasificatoria");

      const dateStr = editingMatch.date.split("T")[0];
      const dateObj = new Date(editingMatch.date);
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      setDays([
        {
          id: "day-edit",
          date: dateStr,
          matches: [
            {
              time: timeStr,
              localTeamId: Number(editingMatch.localTeam?.id || 0),
              awayTeamId: Number(editingMatch.awayTeam?.id || 0),
              category: editingMatch.category || "",
              vocalUserId: Number(editingMatch.vocal?.id || 0),
              fieldId: Number(editingMatch.field?.id || 0),
            },
          ],
        },
      ]);

      // If categories are loaded, find the ID and add it to selection if not present
      if (allCategories.length > 0 && editingMatch.category) {
        const catObj = allCategories.find(
          (c: any) => c.name === editingMatch.category,
        );
        if (catObj && !selectedCategoryIds.includes(Number(catObj.id))) {
          setSelectedCategoryIds((prev) => [...prev, Number(catObj.id)]);
        }
      }
    }
  }, [editingMatch, allCategories]);

  const { data: fieldsData } = useFields();
  const allFields = fieldsData || [];

  // Filtering categories based on metadata selection (if needed by subcomponents)
  const filteredCategories = useMemo(() => {
    if (selectedCategoryIds.length === 0) return allCategories;
    return allCategories.filter((c) =>
      selectedCategoryIds.includes(Number(c.id)),
    );
  }, [allCategories, selectedCategoryIds]);

  const addDay = () => {
    setDays([
      ...days,
      {
        id: `day-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        matches: [],
      },
    ]);
  };

  const updateDay = (index: number, updatedDay: any) => {
    const newDays = [...days];
    newDays[index] = updatedDay;
    setDays(newDays);
  };

  const removeDay = (index: number) => {
    if (days.length === 1) return;
    setDays(days.filter((_, i) => i !== index));
  };

  const assignedVocalsSummary = useMemo(() => {
    const counts = new Map<number, { count: number; name: string }>();
    days.forEach((d) => {
      d.matches.forEach((m: any) => {
        if (m.vocalUserId) {
          const vocalObj = vocals.find(
            (v: any) => Number(v.id) === Number(m.vocalUserId),
          );
          const current = counts.get(Number(m.vocalUserId)) || {
            count: 0,
            name: vocalObj?.name || "Vocal Desconocido",
          };
          counts.set(Number(m.vocalUserId), {
            count: current.count + 1,
            name: current.name,
          });
        }
      });
    });
    return Array.from(counts.entries()).map(([userId, info]) => ({
      userId,
      count: info.count,
      userName: info.name,
    }));
  }, [days, vocals]);

  const handleSave = async () => {
    if (!tournamentId) {
      alert("Selecciona un torneo primero");
      return;
    }

    try {
      const allRows: any[] = [];
      days.forEach((d) => {
        d.matches.forEach((m: any) => {
          allRows.push({
            matchDate: d.date,
            time: m.time,
            localTeamId: Number(m.localTeamId),
            awayTeamId: Number(m.awayTeamId),
            category: m.category,
            vocalUserId: Number(m.vocalUserId),
            fieldId: Number(m.fieldId),
          });
        });
      });

      if (allRows.length === 0) {
        alert("No hay partidos para guardar");
        return;
      }

      // Validation: Ensure all IDs are > 0
      const incompleteMatch = allRows.find(
        (m) =>
          !m.localTeamId ||
          !m.awayTeamId ||
          !m.vocalUserId ||
          m.localTeamId <= 0 ||
          m.awayTeamId <= 0 ||
          m.vocalUserId <= 0,
      );

      if (incompleteMatch) {
        alert(
          "Todos los partidos deben tener equipo local, visitante y vocal asignado.",
        );
        return;
      }

      if (editingMatch) {
        // Update single match mode
        const firstMatch = allRows[0];
        await scheduleApi.updateMatch(editingMatch.id, {
          tournamentId,
          stage,
          matchDay: fecha,
          matchDate: `${firstMatch.matchDate}T${firstMatch.time}:00`,
          localTeamId: firstMatch.localTeamId,
          awayTeamId: firstMatch.awayTeamId,
          category: firstMatch.category,
          vocalUserId: firstMatch.vocalUserId,
          fieldId: firstMatch.fieldId,
        });
        alert("Partido actualizado correctamente");
        onCancelEdit?.();
      } else {
        await scheduleApi.saveProgrammingSheet({
          tournamentId,
          stage,
          matchDay: fecha,
          rows: allRows,
        });
        alert("Hoja de programación guardada correctamente");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar la hoja");
    }
  };

  const handleExportPdf = async () => {
    if (!printRef.current) return;

    setIsExporting(true);
    // Wait for the DOM to render the printable version
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const dataUrl = await toPng(printRef.current, {
        cacheBust: true,
        quality: 1,
        backgroundColor: "#ffffff",
        pixelRatio: 2, // Higher quality
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(
        dataUrl,
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
        undefined,
        "FAST",
      );
      pdf.save(`programacion-fecha-${fecha}.pdf`);
    } catch (err) {
      console.error("PDF export failed", err);
      alert(
        "Error al exportar a PDF. Asegúrate de que las imágenes estén cargadas.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 relative">
      {editingMatch && (
        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="font-bold text-primary italic uppercase tracking-tighter">
                Modo Edición
              </p>
              <p className="text-[10px] text-primary/70">
                Ajustando encuentro programado. Al guardar se actualizará el
                registro.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onCancelEdit}
            className="bg-surface shadow-sm"
          >
            Cancelar Edición
          </Button>
        </div>
      )}
      {/* Configuration Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-wrap items-end gap-4 bg-surface p-4 rounded-xl shadow-soft border border-border no-print">
        <div className="flex-1 min-w-[200px] w-full">
          <label className="ui-label block mb-1">Seleccionar Torneo</label>
          <Select
            value={tournamentId}
            onChange={(e) => setTournamentId(parseInt(e.target.value))}
          >
            <option value={0}>Elegir para Programar...</option>
            {tournaments.map((t: any) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 min-w-[200px] w-full">
          <label className="ui-label block mb-1">Etapa / Fase</label>
          <input
            className="ui-input w-full"
            placeholder="Etapa Clasificatoria, Semi-final, etc."
            value={stage}
            onChange={(e) => setStage(e.target.value)}
          />
        </div>

        <div className="flex flex-row md:flex-col lg:flex-row items-end gap-2 w-full lg:w-auto">
          <Button
            variant="primary"
            onClick={handleSave}
            className="gap-2 flex-1 lg:flex-none h-10"
          >
            <Save className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Guardar</span>
          </Button>
          <Button
            variant="outline"
            onClick={addDay}
            className="gap-2 bg-surface flex-1 lg:flex-none h-10"
          >
            <Plus className="w-4 h-4" />{" "}
            <span className="hidden sm:inline">Añadir Día</span>
          </Button>
        </div>
      </div>

      {!tournamentId && (
        <div className="flex flex-col items-center justify-center p-20 bg-bg border-2 border-dashed border-border rounded-3xl text-text-muted">
          <AlertCircle className="w-16 h-16 mb-4 opacity-20" />
          <p className="type-h3 font-bold">
            Selecciona un torneo para comenzar a programar
          </p>
        </div>
      )}

      {isExporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay/60 backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-border flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-lg">Generando PDF...</p>
            <p className="text-sm text-text-muted">
              Por favor espera un momento
            </p>
          </div>
        </div>
      )}

      {tournamentId > 0 && (
        <div
          ref={sheetRef}
          className="max-w-[1000px] mx-auto shadow-2xl bg-surface border border-border overflow-hidden"
        >
          {/* Header */}
          <ScheduleHeader
            onExportPdf={handleExportPdf}
            logoUrl={logoUrl}
            onLogoChange={setLogoUrl}
            title1={title1}
            onTitle1Change={setTitle1}
            title2={title2}
            onTitle2Change={setTitle2}
            title3={title3}
            onTitle3Change={setTitle3}
          />

          {/* Metadata */}
          <ScheduleMetadata
            categories={allCategories}
            selectedCategoryIds={selectedCategoryIds}
            onChangeCategories={setSelectedCategoryIds}
            fecha={fecha}
            onChangeFecha={setFecha}
            vuelta={vuelta}
            onChangeVuelta={setVuelta}
          />

          {/* Day Sections */}
          <div className="flex flex-col">
            {days.map((day, index) => (
              <ScheduleDaySection
                key={day.id}
                day={day}
                teams={allTeams}
                categories={
                  filteredCategories.length > 0
                    ? filteredCategories
                    : allCategories
                }
                vocals={vocals}
                fields={allFields}
                onUpdateDay={(updated: any) => updateDay(index, updated)}
                onRemoveDay={() => removeDay(index)}
              />
            ))}
          </div>

          {/* Footer / Vocals Summary */}
          <ScheduleVocalsSummary assignedVocals={assignedVocalsSummary} />
        </div>
      )}

      {/* Hidden Print Template */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div ref={printRef}>
          <SchedulePrintTemplate
            logoUrl={logoUrl}
            title1={title1}
            title2={title2}
            title3={title3}
            fecha={fecha}
            vuelta={vuelta}
            days={days}
            teams={allTeams}
            categories={allCategories}
            vocals={vocals}
            fields={allFields}
            assignedVocalsSummary={assignedVocalsSummary}
          />
        </div>
      </div>
    </div>
  );
};
