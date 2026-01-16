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
import { exportCarnetsToPDF } from "../utils/exportCarnetsPDF.util";
import { exportCarnetsToZIP } from "../utils/exportCarnetsToZIP.util";
import { leagueApi } from "@/features/administration/api/league.api";
import { useEffect } from "react";

const CarnetizationPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  // Applied filters (actual filters used for fetching)
  const [appliedCategory, setAppliedCategory] = useState<string | undefined>(
    undefined
  );
  const [appliedTeam, setAppliedTeam] = useState<string | undefined>(undefined);
  const [appliedSearch, setAppliedSearch] = useState("");

  const [carnetColor, setCarnetColor] = useState<
    "orange" | "blue" | "red" | "purple"
  >("orange");

  // Customization state
  const [leagueName, setLeagueName] = useState(
    "Liga Deportiva Barrial San Fernando"
  );
  const [presidentName, setPresidentName] = useState("Sr. Marco Martínez");
  const [activeYear, setActiveYear] = useState("2025-2026");
  const [leagueLogo, setLeagueLogo] = useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = useState("");
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Auto-fetch League Logo
  useEffect(() => {
    const fetchLeagueInfo = async () => {
      try {
        const response = await leagueApi.getLeagues({ limit: 1 });
        if (response.data.length > 0 && response.data[0].imageUrl) {
          setLeagueLogo(response.data[0].imageUrl);
        }
      } catch (error) {
        console.error("Error fetching league info:", error);
      }
    };
    fetchLeagueInfo();
  }, []);

  // Data fetching
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.data || [];

  const { data: teamsData } = useTeams({
    category: selectedCategory ? Number(selectedCategory) : undefined,
  });
  const teams = teamsData?.data || [];

  const { data: playersData, isLoading } = usePlayers({
    categoryId: appliedCategory ? Number(appliedCategory) : undefined,
    teamId: appliedTeam ? Number(appliedTeam) : undefined,
    limit: 100, // Load many players for carnetization
  });

  const filteredPlayers = useMemo(() => {
    if (!playersData?.data) return [];
    if (!appliedSearch && !appliedCategory && !appliedTeam) return []; // Don't show anything until searched

    return playersData.data.filter(
      (p: Player) =>
        p.name.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        p.lastname?.toLowerCase().includes(appliedSearch.toLowerCase()) ||
        p.dni.includes(appliedSearch)
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

  const handlePrint = () => {
    if (!selectedCategory || !selectedTeam) {
      setShowWarningModal(true);
      return;
    }
    window.print();
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
          teams.find((t) => t.id === Number(appliedTeam))?.name || ""
        }-${
          categories.find((c) => c.id === Number(appliedCategory))?.name || ""
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
        teamName: teams.find((t) => t.id === Number(appliedTeam))?.name || "",
        categoryName:
          categories.find((c) => c.id === Number(appliedCategory))?.name || "",
      });
    } finally {
      hideLoader();
    }
  };

  const colors = [
    { id: "orange", name: "Naranja", class: "bg-orange-500" },
    { id: "blue", name: "Azul", class: "bg-blue-500" },
    { id: "red", name: "Rojo", class: "bg-red-500" },
    { id: "purple", name: "Morado", class: "bg-purple-500" },
  ];

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header - Hidden on Print */}
      <div className="print:hidden flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="type-h2 font-black">
            Generación de <span className="text-primary">Carnets</span>
          </h1>
          <p className="text-text-muted">
            Selecciona categoría y equipo para generar los carnets.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Controls - Hidden on Print */}
      <div className="print:hidden space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-surface p-6 rounded-2xl border border-border shadow-sm">
          {/* Filters */}
          <div className="space-y-4 lg:col-span-3">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtros de Selección
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Categoría
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Filter className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setSelectedTeam("");
                    }}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer text-sm font-medium"
                  >
                    <option value="">Todas las categorías</option>
                    {categories.map((cat: Category) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Equipo
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Filter className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    disabled={!selectedCategory}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:ring-2 focus:ring-primary/30 outline-none cursor-pointer text-sm font-medium disabled:opacity-50"
                  >
                    <option value="">Todos los equipos</option>
                    {teams.map((team: Team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">
                  Buscar Jugador
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    placeholder="DNI o Nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="primary"
                  onClick={handleSearch}
                  className="flex-1 h-[42px]"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleClearFilters}
                  className="flex-1 h-[42px]"
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Estilo
            </label>
            <div className="space-y-4">
              <label className="text-xs font-bold text-text-muted uppercase">
                Color del Carnet
              </label>
              <div className="flex gap-3">
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
        </div>

        {/* Customization Controls */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Personalización del Carnet (Reverso)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Nombre de la Liga
              </label>
              <Input
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                placeholder="Nombre de la Liga"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Presidente de la Liga
              </label>
              <Input
                value={presidentName}
                onChange={(e) => setPresidentName(e.target.value)}
                placeholder="Nombre del Presidente"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Año de Vigencia
              </label>
              <Input
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                placeholder="Ej: 2025-2026"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                Logo de la Liga (URL)
              </label>
              <Input
                value={leagueLogo || ""}
                onChange={(e) => setLeagueLogo(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">
                URL de la Firma del Presidente (Parte Posterior)
              </label>
              <Input
                value={signatureUrl}
                onChange={(e) => setSignatureUrl(e.target.value)}
                placeholder="https://... (PNG con fondo transparente recomendado)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Info Message - Hidden on Print */}
      {filteredPlayers.length > 0 && (
        <div className="print:hidden bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
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
            {teams.find((t) => t.id === Number(appliedTeam))?.name || "N/A"}
          </span>
          <span>
            CATEGORÍA:{" "}
            {categories.find((c) => c.id === Number(appliedCategory))?.name ||
              "N/A"}
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

      {/* Print Styles */}
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
