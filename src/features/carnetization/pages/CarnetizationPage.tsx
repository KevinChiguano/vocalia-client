import { useState, useMemo } from "react";
import { Search, Printer, Palette, Info, Filter, Download } from "lucide-react";
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
import { SectionHeader } from "@/components/ui/SectionHeader";
import { exportCarnetsToPDF } from "../utils/exportCarnetsPDF.util";
import { exportCarnetsToZIP } from "../utils/exportCarnetsToZIP.util";

const CarnetizationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const [appliedCategory, setAppliedCategory] = useState<string | undefined>(
    undefined,
  );
  const [appliedTeam, setAppliedTeam] = useState<string | undefined>(undefined);
  const [appliedSearch, setAppliedSearch] = useState("");

  const [carnetColor, setCarnetColor] = useState<
    "gold" | "blue" | "red" | "purple"
  >("gold");

  const [leagueName, setLeagueName] = useState(
    "Liga Deportiva Barrial San Fernando",
  );
  const [presidentName, setPresidentName] = useState("Sr. Marco Martínez");
  const [activeYear, setActiveYear] = useState("2025-2026");
  const [leagueLogo, setLeagueLogo] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

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

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSelectedTeam("");
    setSearchTerm("");
    setAppliedCategory(undefined);
    setAppliedTeam(undefined);
    setAppliedSearch("");
  };

  const handleDownloadAllZIP = async () => {
    if (!selectedCategory || !selectedTeam) {
      setShowWarningModal(true);
      return;
    }

    if (filteredPlayers.length === 0) return;

    const { showLoader, hideLoader } = useUIStore.getState();
    showLoader();
    try {
      await exportCarnetsToZIP({
        players: filteredPlayers,
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

    const { showLoader, hideLoader } = useUIStore.getState();
    showLoader();
    try {
      await exportCarnetsToPDF({
        players: filteredPlayers,
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
    { id: "gold", name: "Dorado", class: "bg-[#f4c430]" },
    { id: "blue", name: "Azul", class: "bg-blue-500" },
    { id: "red", name: "Rojo", class: "bg-red-500" },
    { id: "purple", name: "Morado", class: "bg-purple-500" },
  ];

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Generación de <span className="text-primary">Carnets</span>
          </>
        }
        description="Selecciona categoría y equipo para generar los carnets."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={handleDownloadAllZIP}
              disabled={filteredPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar Todas (ZIP)
            </Button>
            <Button
              variant="primary"
              onClick={handleDownloadAllPDF}
              disabled={filteredPlayers.length === 0}
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir Todo (PDF)
            </Button>
          </>
        }
      />

      <div className="print:hidden space-y-6">
        <Card className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4 lg:col-span-3">
            <SectionHeader title="Filtros de Selección" icon={Filter} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Select
                label="Categoría"
                value={selectedCategory}
                icon={<Filter className="w-4 h-4" />}
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
                icon={<Filter className="w-4 h-4" />}
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

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                  Buscar Jugador
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Search className="w-4 h-4" />
                  </div>
                  <Input
                    placeholder="DNI o Nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2 md:col-span-3 lg:col-span-3">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="flex-1 md:flex-none md:w-40 h-[42px]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="flex-1 md:flex-none md:w-40 h-[42px]"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:border-l lg:border-border lg:pl-6 border-t border-border pt-6 lg:pt-0 lg:border-t-0">
            <SectionHeader title="Estilo" icon={Palette} />
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-muted uppercase">
                Color del Carnet
              </label>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setCarnetColor(color.id as any)}
                    className={`w-10 h-10 rounded-full border-4 hover:scale-110 ${
                      color.class
                    } ${
                      carnetColor === color.id
                        ? "border-text scale-110"
                        : "border-transparent"
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Customization Controls */}
        <Card className="space-y-6">
          <SectionHeader
            title="Personalización del Carnet (Reverso)"
            icon={Palette}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Nombre de la Liga
              </Label>
              <Input
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Nombre de la Liga"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Presidente de la Liga
              </Label>
              <Input
                value={presidentName}
                onChange={(e) => setPresidentName(e.target.value)}
                placeholder="Nombre del Presidente"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Año de Vigencia
              </Label>
              <Input
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                placeholder="Ej: 2025-2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Logo de la Liga (URL)
              </Label>
              <Input
                value={leagueLogo || ""}
                onChange={(e) => setLeagueLogo(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5 lg:col-span-2">
              <Label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                URL de la Firma del Presidente (Parte Posterior)
              </Label>
              <Input
                value={signatureUrl}
                onChange={(e) => setSignatureUrl(e.target.value)}
                placeholder="https://... (PNG con fondo transparente recomendado)"
              />
            </div>
          </div>
        </Card>
      </div>

      {filteredPlayers.length > 0 && (
        <div className="print:hidden bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-700 dark:text-blue-300 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900 dark:text-blue-100">
            Se han encontrado <strong>{filteredPlayers.length}</strong>{" "}
            jugadores. Se imprimen frente y reverso secuencialmente. Para
            mejores resultados, ajusta el tamaño de papel a A4 y elimina
            márgenes en la configuración de impresión.
          </p>
        </div>
      )}

      {/* Print-only Header */}
      <div className="hidden print:block mb-8 text-center border-b-2 border-gray-200 pb-4">
        <h1 className="text-2xl font-black uppercase tracking-widest text-gray-800">
          Carnets de Jugadores
        </h1>
        <div className="flex justify-center gap-8 mt-2 text-lg font-bold text-gray-600">
          <span>
            EQUIPO:{" "}
            {teams.find((t: Team) => t.id === Number(appliedTeam))?.name ||
              "N/A"}
          </span>
          <span>
            CATEGORÍA:{" "}
            {categories.find((c: Category) => c.id === Number(appliedCategory))
              ?.name || "N/A"}
          </span>
        </div>
      </div>

      {/* Grid of Carnets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8 print:block print:w-full">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-text-muted font-medium">
              Cargando jugadores...
            </p>
          </div>
        ) : filteredPlayers.length > 0 ? (
          filteredPlayers.map((player: Player) => (
            <div key={player.dni} className="print:mb-0 print:block">
              <CarnetPreview
                player={player}
                color={carnetColor}
                leagueName={leagueName}
                presidentName={presidentName}
                activeYear={activeYear}
                leagueLogoUrl={leagueLogo || undefined}
                signatureUrl={signatureUrl || undefined}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-surface rounded-2xl border-2 border-dashed border-border">
            <p className="text-text-muted font-medium">
              No se encontraron jugadores con los filtros seleccionados.
            </p>
          </div>
        )}
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
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CarnetizationPage;
