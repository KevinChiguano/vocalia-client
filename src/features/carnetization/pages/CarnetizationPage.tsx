import { useState, useMemo } from "react";
import { Search, Printer, Palette, Filter, Download, List } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useUIStore } from "@/store/ui.store";
import { CarnetPreview } from "../components/CarnetPreview";
import { usePlayers } from "@/features/qualifications/api/player.hooks";
import { useCategories } from "@/features/qualifications/api/category.hooks";
import { useTeams } from "@/features/qualifications/api/team.hooks";
import { Player } from "@/features/qualifications/types/player.types";
import { Category } from "@/features/qualifications/types/category.types";
import { Team } from "@/features/qualifications/types/team.types";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { exportCarnetsToPDF } from "../utils/exportCarnetsPDF.util";
import { exportCarnetsToZIP } from "../utils/exportCarnetsToZIP.util";
import logoDefault from "@/assets/logo_san_fernando.png";

const CarnetizationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const [appliedCategory, setAppliedCategory] = useState<string | undefined>(
    undefined,
  );
  const [appliedTeam, setAppliedTeam] = useState<string | undefined>(undefined);
  const [appliedSearch, setAppliedSearch] = useState("");

  const [carnetColor, setCarnetColor] = useState<
    "primary" | "info" | "success" | "slate"
  >("primary");

  const [leagueName, setLeagueName] = useState(
    "Liga Deportiva Barrial San Fernando",
  );
  const [presidentName, setPresidentName] = useState("Sr. Marco Martínez");
  const [activeYear, setActiveYear] = useState("2025-2026");
  const [leagueLogo, setLeagueLogo] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [exportLogoBase64, setExportLogoBase64] = useState("");

  // Data fetching
  const { data: categoriesData } = useCategories(undefined, { silent: true });
  const categories = categoriesData?.data || [];

  const { data: teamsData } = useTeams(
    {
      category: selectedCategory ? Number(selectedCategory) : undefined,
    },
    { silent: true },
  );
  const teams = teamsData?.data || [];

  // Categoría aplicada actualmente a los resultados (para logos consistentes)
  const { data: searchTeamsData } = useTeams(
    {
      category: appliedCategory ? Number(appliedCategory) : undefined,
    },
    { silent: true },
  );
  const searchTeams = searchTeamsData?.data || [];

  const teamLogoMap = useMemo(() => {
    const map: Record<number, string> = {};
    // Primero los equipos de la búsqueda (prioridad)
    searchTeams.forEach((t: Team) => {
      if (t.id && t.logo) map[t.id] = t.logo;
    });
    // Luego los equipos de los selectores (dropdown)
    teams.forEach((t: Team) => {
      if (t.id && t.logo) map[t.id] = t.logo;
    });
    return map;
  }, [searchTeams, teams]);

  const appliedTeamLogo = useMemo(() => {
    if (!appliedTeam) return undefined;
    const teamId = Number(appliedTeam);
    return teamLogoMap[teamId];
  }, [appliedTeam, teamLogoMap]);

  const { data: playersData, isLoading } = usePlayers(
    {
      categoryId: appliedCategory ? Number(appliedCategory) : undefined,
      teamId: appliedTeam ? Number(appliedTeam) : undefined,
      limit: 100,
    },
    { silent: true },
  );

  const filteredPlayers = useMemo(() => {
    if (!playersData?.data) return [];
    if (!appliedSearch && !appliedCategory && !appliedTeam) return [];

    return playersData.data.filter(
      (p: Player) =>
        (p.name?.toLowerCase() || "").includes(appliedSearch.toLowerCase()) ||
        (p.lastname?.toLowerCase() || "").includes(
          appliedSearch.toLowerCase(),
        ) ||
        (p.dni || "").includes(appliedSearch),
    );
  }, [playersData, appliedSearch, appliedCategory, appliedTeam]);

  const handleSearch = () => {
    setAppliedCategory(selectedCategory || undefined);
    setAppliedTeam(selectedTeam || undefined);
    setAppliedSearch(searchTerm);
  };

  const handleDownloadAllZIP = async () => {
    if (!selectedCategory || !selectedTeam) {
      setShowWarningModal(true);
      return;
    }

    const playersToExport = filteredPlayers.filter((p) =>
      selectedPlayers.includes(p.dni),
    );

    if (playersToExport.length === 0) return;

    const { showLoader, hideLoader } = useUIStore.getState();
    showLoader();
    try {
      await exportCarnetsToZIP({
        players: playersToExport,
        zipName: `carnets-${
          teams.find((t: Team) => t.id === Number(appliedTeam))?.name || ""
        }-${
          categories.find((c: Category) => c.id === Number(appliedCategory))
            ?.name || ""
        }`,
      });
    } finally {
      hideLoader();
    }
  };

  const handleDownloadAllPDF = async () => {
    if (!selectedCategory || !selectedTeam) {
      setShowWarningModal(true);
      return;
    }

    const playersToExport = filteredPlayers.filter((p) =>
      selectedPlayers.includes(p.dni),
    );

    if (playersToExport.length === 0) return;

    const { showLoader, hideLoader } = useUIStore.getState();
    showLoader();
    try {
      let logoBase64 = exportLogoBase64;
      if (!logoBase64) {
        try {
          const response = await fetch(logoDefault);
          const blob = await response.blob();
          logoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
          setExportLogoBase64(logoBase64);
        } catch (err) {
          console.warn("Could not load logo for PDF", err);
        }
      }

      await exportCarnetsToPDF({
        players: playersToExport,
        teamName:
          teams.find((t: Team) => t.id === Number(appliedTeam))?.name || "",
        categoryName:
          categories.find((c: Category) => c.id === Number(appliedCategory))
            ?.name || "",
      });
    } finally {
      hideLoader();
    }
  };

  const colors = [
    {
      id: "primary",
      name: "Primario",
      class: "bg-primary border-primary-soft hover:border-primary",
    },
    {
      id: "info",
      name: "Azul",
      class: "bg-info border-info-soft hover:border-info",
    },
    {
      id: "success",
      name: "Verde",
      class: "bg-success border-success-soft hover:border-success",
    },
    {
      id: "slate",
      name: "Gris",
      class: "bg-slate-700 border-slate-600 hover:border-slate-500",
    },
  ];

  const selectedPlayer = useMemo(() => {
    return (
      filteredPlayers.find((p) => selectedPlayers.includes(p.dni)) ||
      ({
        dni: "0000000000",
        name: "NOMBRE",
        lastname: "APELLIDO",
        number: "00",
        category: { name: "CATEGORÍA" },
        team: { name: "EQUIPO" },
      } as unknown as Player)
    );
  }, [filteredPlayers, selectedPlayers]);

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Generación de <span className="text-primary">Carnets</span>
          </>
        }
        description="Selecciona categoría y equipo para generar los carnets."
      />

      {/* Main Grid Layout from Template */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 print:block">
        {/* Left Column: Controls & Configuration */}
        <div className="xl:col-span-4 flex flex-col gap-6 print:hidden">
          {/* Filters Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-text text-xl font-bold">Filtros</h2>
            </div>
            <div className="space-y-4">
              <Select
                label="Categoría"
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedTeam("");
                }}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat: Category) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Equipo"
                value={selectedTeam}
                disabled={!selectedCategory}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Todos los equipos</option>
                {teams.map((team: Team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.category?.name || "Sin Cat."})
                  </option>
                ))}
              </Select>

              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={!selectedCategory || !selectedTeam}
                className="w-full h-10"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </Card>

          {/* Style Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-text text-xl font-bold">Estilo del Carnet</h2>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setCarnetColor(color.id as any)}
                  className={`aspect-square rounded-lg border-2 transition-all ${color.class} ${
                    carnetColor === color.id
                      ? "ring-2 ring-offset-2 ring-primary ring-offset-surface scale-105 border-transparent"
                      : ""
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </Card>

          {/* Personalization Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-5 h-5 text-primary" />
              <h2 className="text-text text-xl font-bold">Reverso</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Liga
                </Label>
                <Input
                  value={leagueName}
                  onChange={(e) => setLeagueName(e.target.value)}
                  placeholder="Nombre de la Liga"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Presidente
                </Label>
                <Input
                  value={presidentName}
                  onChange={(e) => setPresidentName(e.target.value)}
                  placeholder="Nombre del Presidente"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Vigencia
                  </Label>
                  <Input
                    value={activeYear}
                    onChange={(e) => setActiveYear(e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                    Logo URL
                  </Label>
                  <Input
                    value={leagueLogo || ""}
                    onChange={(e) => setLeagueLogo(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Firma URL
                </Label>
                <Input
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Preview & List */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* Preview Area */}
          <Card className="p-8 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <h2 className="text-text text-xl font-bold">Vista Previa</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadAllZIP}
                  disabled={selectedPlayers.length === 0}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar ZIP
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleDownloadAllPDF}
                  disabled={selectedPlayers.length === 0}
                  className="flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir PDF
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-10">
              <CarnetPreview
                idPrefix="preview-"
                player={selectedPlayer}
                color={carnetColor as any}
                leagueName={leagueName}
                presidentName={presidentName}
                activeYear={activeYear}
                leagueLogoUrl={leagueLogo || undefined}
                signatureUrl={signatureUrl || undefined}
                logoUrl={
                  teamLogoMap[Number(selectedPlayer.teamId)] ||
                  appliedTeamLogo ||
                  selectedPlayer.team?.logo ||
                  undefined
                }
              />
            </div>
            <p className="text-center mt-6 text-text-subtle text-xs italic">
              Vista frontal y posterior del carnet.
            </p>
          </Card>

          {/* Player Selection List */}
          <Card className="p-6 print:hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <List className="w-5 h-5 text-primary" />
                <h2 className="text-text text-xl font-bold">
                  Seleccionar Jugadores
                </h2>
              </div>
              <div className="relative w-full md:w-64">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  placeholder="Buscar en la lista..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-text-muted text-sm">Cargando...</p>
                </div>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <Checkbox
                          checked={
                            filteredPlayers.length > 0 &&
                            selectedPlayers.length === filteredPlayers.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPlayers(
                                filteredPlayers.map((p) => p.dni),
                              );
                            } else {
                              setSelectedPlayers([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Jugador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Carnet
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-text-muted uppercase tracking-wider">
                        Equipo
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPlayers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-text-muted text-sm"
                        >
                          No hay jugadores para mostrar. Ajusta los filtros.
                        </td>
                      </tr>
                    ) : (
                      filteredPlayers.map((player) => (
                        <tr
                          key={player.dni}
                          className="hover:bg-hover transition-colors"
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedPlayers.includes(player.dni)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPlayers((prev) => [
                                    ...prev,
                                    player.dni,
                                  ]);
                                } else {
                                  setSelectedPlayers((prev) =>
                                    prev.filter((id) => id !== player.dni),
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface border border-border overflow-hidden shrink-0">
                                {player.imageUrl ? (
                                  <img
                                    src={player.imageUrl}
                                    alt={player.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-elevated text-text-muted text-xs font-bold">
                                    {(player.name?.[0] || "") +
                                      (player.lastname?.[0] || "")}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div
                                  className="font-bold text-text text-sm cursor-pointer hover:underline"
                                  onClick={() =>
                                    setSelectedPlayers([player.dni])
                                  }
                                  title="Ver Detalle"
                                >
                                  {player.name} {player.lastname}
                                </div>
                                <div className="text-xs text-text-subtle">
                                  {player.dni}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {player.imageUrl ? (
                              <Badge variant="success">Listo</Badge>
                            ) : (
                              <Badge variant="warning">Falta Foto</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-muted">
                            {player.team?.name || "N/A"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-text-muted font-medium">
              <span>Mostrando {filteredPlayers.length} jugadores</span>
              {selectedPlayers.length > 0 && (
                <span>{selectedPlayers.length} seleccionados</span>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Print-only Container (Visible only when Printing, but rendered for export capture) */}
      <div className="absolute top-[-9999px] left-[-9999px] print:static print:top-auto print:left-auto">
        {/* PDF Standardized Header (Used by HTML-to-Image in PDF Export) */}
        <div
          id="carnet-export-header"
          className="w-[1240px] bg-white text-black p-12 font-sans border-b-4 border-primary pb-6 mb-8 flex items-center justify-between"
        >
          <div className="flex items-center gap-6">
            <img
              src={exportLogoBase64 || logoDefault}
              alt="Liga San Fernando Logo"
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                LIGA INDEPENDIENTE, SOCIAL Y CULTURAL
              </h1>
              <h2 className="text-xl font-bold text-gray-600 mt-1 italic">
                " SAN FERNANDO DE GUAMANI "
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                  REPORTE DE CARNETIZACIÓN
                </span>
                <span className="text-gray-500 text-sm font-medium">
                  {categories.find(
                    (c: Category) => c.id === Number(appliedCategory),
                  )?.name || "N/A"}{" "}
                  -{" "}
                  {teams.find((t: Team) => t.id === Number(appliedTeam))
                    ?.name || "N/A"}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">
              Fecha de Emisión
            </p>
            <p className="text-lg font-bold text-gray-900">
              {new Date().toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlayers
            .filter((p) => selectedPlayers.includes(p.dni))
            .map((player) => (
              <div key={player.dni} className="print:mb-0">
                <CarnetPreview
                  idPrefix="print-"
                  player={player}
                  color={carnetColor as any}
                  leagueName={leagueName}
                  presidentName={presidentName}
                  activeYear={activeYear}
                  leagueLogoUrl={leagueLogo || undefined}
                  signatureUrl={signatureUrl || undefined}
                  logoUrl={
                    teamLogoMap[Number(player.teamId)] ||
                    appliedTeamLogo ||
                    player.team?.logo ||
                    undefined
                  }
                />
              </div>
            ))}
        </div>
      </div>

      <ConfirmModal
        open={showWarningModal}
        title="Filtros Requeridos"
        description="Debes seleccionar una categoría y un equipo específico para poder realizar la impresión o exportación masiva."
        onConfirm={() => setShowWarningModal(false)}
        onClose={() => setShowWarningModal(false)}
        confirmText="Entendido"
      />

      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            margin: 1cm;
            background: white !important;
          }
          .print\\:block {
            display: block !important;
            height: auto !important;
            opacity: 1 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CarnetizationPage;
