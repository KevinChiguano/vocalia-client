import { useEffect, useState } from "react";
import {
  Search,
  X,
  Users,
  Edit,
  Trash2,
  UserSearch,
  Shield,
  ArrowLeft,
  Upload,
  UserPlus,
} from "lucide-react";
import { playerApi } from "../api/player.api";
import { teamApi } from "../api/team.api";
import { categoryApi } from "../api/category.api";
import { Player, PlayerFilters, CreatePlayerDto } from "../types/player.types";
import { Team } from "../types/team.types";
import { Category } from "../types/category.types";
import { PlayerForm } from "../components/PlayerForm";
import { BulkImportPlayerModal } from "./BulkImportPlayerModal";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaginationFooter } from "@/components/ui/PaginationFooter";
import { LimitSelector } from "@/components/ui/LimitSelector";
import { BaseTable } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useUIStore } from "@/store/ui.store";

export const PlayersTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setCustomBreadcrumbs = useUIStore(
    (state) => state.setCustomBreadcrumbs,
  );
  const initialTeamId = searchParams.get("teamId");
  const initialCategoryId = searchParams.get("categoryId");

  const [players, setPlayers] = useState<Player[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<PlayerFilters>({
    search: "",
    teamId: initialTeamId ? Number(initialTeamId) : undefined,
    categoryId: initialCategoryId ? Number(initialCategoryId) : undefined,
    active: undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteDni, setDeleteDni] = useState<string | null>(null);

  // Sync searchParams to filters (for redirections while mounted)
  useEffect(() => {
    const teamId = searchParams.get("teamId");
    const categoryId = searchParams.get("categoryId");

    if (teamId || categoryId) {
      setFilters((prev) => ({
        ...prev,
        teamId: teamId ? Number(teamId) : prev.teamId,
        categoryId: categoryId ? Number(categoryId) : prev.categoryId,
      }));
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [searchParams]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const promises: Promise<any>[] = [
        playerApi.getPlayers(
          {
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search,
            teamId: filters.teamId,
            categoryId: filters.categoryId,
            active: filters.active,
          },
          { silent },
        ),
        categoryApi.getCategories({ limit: 100 }, { silent }),
      ];

      // Only fetch the active team if we have a teamId and haven't fetched it yet
      // OR if the filter teamId changed
      if (filters.teamId && (!activeTeam || activeTeam.id !== filters.teamId)) {
        promises.push(teamApi.getTeamById(filters.teamId));
      }

      const results = await Promise.all(promises);
      const playersData = results[0];
      const categoriesData = results[1];

      setPlayers(playersData.data || []);
      setPagination((prev) => ({ ...prev, ...playersData.meta }));
      setCategories(categoriesData.data || []);

      if (results[2]) {
        setActiveTeam(results[2]);
      }
    } catch (error: any) {
      console.error("Error fetching players/teams", error);
      setPlayers([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    pagination.page,
    pagination.limit,
    filters.search,
    filters.teamId,
    filters.categoryId,
    filters.active,
  ]);

  // Handle custom breadcrumbs
  useEffect(() => {
    if (activeTeam) {
      setCustomBreadcrumbs([
        { label: "Equipos", path: "/qualifications" },
        { label: activeTeam.name },
      ]);
    }
    return () => setCustomBreadcrumbs(null);
  }, [activeTeam, setCustomBreadcrumbs]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleBackToTeams = () => {
    navigate("?", { replace: true });
  };

  const handleCreate = () => {
    setEditingPlayer(null);
    setIsFormOpen(true);
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteDni) {
      try {
        await playerApi.deletePlayer(deleteDni);
        setDeleteDni(null);
        fetchData();
      } catch (error) {
        console.error("Error deleting player", error);
      }
    }
  };

  const handleFormSubmit = async (data: CreatePlayerDto) => {
    setFormLoading(true);
    try {
      if (editingPlayer) {
        await playerApi.updatePlayer(editingPlayer.dni, data);
      } else {
        await playerApi.createPlayer(data);
      }
      // Esperar a la actualización antes de cerrar
      await fetchData(false);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving player", error);
    } finally {
      setFormLoading(false);
    }
  };

  const columns = [
    { key: "photo", label: "Foto", width: "60px" },
    {
      key: "name",
      label: "Nombre del Jugador",
      width: "200px",
      sortable: true,
      sortValue: (r: Player) => `${r.name} ${r.lastname || ""}`,
    },
    {
      key: "dni",
      label: "DNI / Cédula",
      width: "120px",
      sortable: true,
      sortValue: (r: Player) => r.dni,
    },
    {
      key: "number",
      label: "Camiseta",
      width: "100px",
      sortable: true,
      sortValue: (r: Player) => r.number || 0,
    },
    {
      key: "category",
      label: "Categoría",
      width: "130px",
      sortable: true,
      sortValue: (r: Player) => r.category?.name || "",
    },
    { key: "status", label: "Estado", width: "120px" },
    {
      key: "actions",
      label: "Acciones",
      width: "100px",
      align: "right" as any,
    },
  ];

  if (!filters.teamId) {
    // Failsafe in case somehow rendered without a teamId.
    return (
      <div className="flex justify-center p-8">
        <Button onClick={handleBackToTeams}>Ir a Equipos</Button>
      </div>
    );
  }

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <span className="flex items-center gap-4">
            <span className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-red-900 p-2.5 flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden shrink-0">
              {activeTeam?.logo ? (
                <img
                  src={activeTeam.logo}
                  alt="Logo"
                  className="w-full h-full object-contain drop-shadow"
                />
              ) : (
                <Shield className="text-white w-8 h-8" />
              )}
            </span>
            <span>
              Nómina:{" "}
              <span className="text-primary">
                {activeTeam?.name || "Cargando..."}
              </span>
            </span>
          </span>
        }
        description="Gestión centralizada de plantilla y jugadores federados."
        actions={
          <Button
            variant="secondary"
            className="h-11 px-6 gap-2 group border-border hover:bg-surface-hover shrink-0 font-semibold"
            onClick={handleBackToTeams}
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Regresar a Equipos
          </Button>
        }
      />

      <div className="flex flex-col flex-1 gap-6">
        {/* Action Toolbar */}
        <div className="bg-surface p-4 rounded-xl border border-border flex flex-col lg:flex-row gap-4">
          <div className="flex flex-1 flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <Input
                className="w-full pl-10 h-11 bg-background text-text"
                placeholder="Buscar por nombre o DNI..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="secondary"
              className="h-11 px-6 gap-2"
              onClick={() => setIsImportModalOpen(true)}
              disabled={!activeTeam}
            >
              <Upload className="w-5 h-5" />
              <span>Importar Excel</span>
            </Button>
            <Button
              className="h-11 px-6 gap-2 shadow-lg shadow-primary/20"
              onClick={handleCreate}
              disabled={!activeTeam}
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-bold">Nuevo Jugador</span>
            </Button>
          </div>
        </div>

        {/* Players Table Area */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-24 bg-surface rounded-xl border border-border">
              <InlineSpinner label="Cargando jugadores..." size={40} />
            </div>
          ) : players.length > 0 ? (
            <>
              {/* Top Control Bar: Limit Selector */}
              <div className="flex items-center justify-end">
                <LimitSelector
                  value={pagination.limit}
                  onChange={(limit) =>
                    setPagination((prev) => ({ ...prev, limit, page: 1 }))
                  }
                />
              </div>

              {/* Table */}
              <BaseTable
                columns={columns}
                data={players}
                renderRow={(player: Player) => [
                  <div className="w-10 h-10 rounded-full bg-surface border border-border/50 overflow-hidden shrink-0">
                    {player.imageUrl ? (
                      <img
                        src={player.imageUrl}
                        alt={player.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </div>,
                  <div className="flex flex-col">
                    <span className="font-medium text-text">
                      {player.name} {player.lastname}
                    </span>
                    {player.birthDate && (
                      <span className="text-xs text-text-muted">
                        Nac.: {formatDateForDisplay(player.birthDate)}
                      </span>
                    )}
                  </div>,
                  <span className="font-mono text-text-muted">
                    {player.dni}
                  </span>,
                  <div className="inline-flex items-center justify-center size-8 rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/30">
                    {player.number || "0"}
                  </div>,
                  <span className="text-text-muted">
                    {player.category?.name || "-"}
                  </span>,
                  <Badge
                    variant={player.isActive ? "success" : "danger"}
                    size="sm"
                    className="font-bold"
                  >
                    {player.isActive ? "Activo" : "Inactivo"}
                  </Badge>,
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(player)}
                      className="text-text-muted hover:text-text hover:bg-surface-hover h-9 w-9 p-0"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteDni(player.dni)}
                      className="text-text-muted hover:text-red-500 hover:bg-red-500/10 h-9 w-9 p-0"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>,
                ]}
                renderMobileRow={(player: Player) => (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-border/50 overflow-hidden bg-surface shrink-0">
                        {player.imageUrl ? (
                          <img
                            src={player.imageUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-text truncate">
                          {player.name} {player.lastname}
                        </h4>
                        <p className="text-xs text-text-muted font-mono">
                          {player.dni}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(player)}
                          className="text-text-muted hover:text-text bg-surface-hover"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDni(player.dni)}
                          className="text-text-muted hover:text-red-500 bg-surface-hover hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted min-w-[70px]">
                          Camiseta:
                        </span>
                        <span className="font-black text-primary">
                          {player.number || "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-muted min-w-[70px]">
                          Estado:
                        </span>
                        <Badge variant={player.isActive ? "success" : "danger"}>
                          {player.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <span className="text-text-muted min-w-[70px]">
                          Categoría:
                        </span>
                        <span className="text-text font-medium truncate">
                          {player.category?.name || "-"}
                        </span>
                      </div>
                      {player.birthDate && (
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <span className="text-text-muted min-w-[70px]">
                            Fecha Nac.:
                          </span>
                          <span className="text-text">
                            {formatDateForDisplay(player.birthDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              />

              {/* Bottom Control Bar: Pagination */}
              <PaginationFooter
                currentCount={players.length}
                totalCount={pagination.total}
                itemName="jugadores registrados"
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
                className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 px-4 bg-surface/50 border border-border/50 rounded-xl">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <UserSearch className="w-12 h-12 text-primary opacity-50" />
              </div>
              <p className="text-text font-bold text-2xl text-center">
                No se encontraron jugadores
              </p>
              <p className="text-text-muted text-center max-w-sm mt-2">
                {filters.search
                  ? "Prueba buscando con otro término."
                  : "Empieza registrando jugadores en la nómina de este equipo."}
              </p>
            </div>
          )}
        </div>

        {activeTeam && categories.length > 0 && (
          <PlayerForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleFormSubmit}
            initialData={editingPlayer}
            teams={[activeTeam]}
            categories={categories}
            isLoading={formLoading}
          />
        )}

        <ConfirmModal
          open={!!deleteDni}
          onClose={() => setDeleteDni(null)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Jugador"
          description="Esta acción eliminará al jugador de forma permanente. ¿Deseas continuar?"
          danger
        />

        {activeTeam && (
          <BulkImportPlayerModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={() => fetchData()}
            teamId={activeTeam.id}
            categoryId={activeTeam.categoryId || undefined}
            teams={[activeTeam]}
            categories={categories}
          />
        )}
      </div>
    </div>
  );
};
