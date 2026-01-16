import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  X,
  Users,
  Filter,
  Edit,
  Trash2,
  UserSearch,
} from "lucide-react";
import { playerApi } from "../api/player.api";
import { teamApi } from "../api/team.api";
import { categoryApi } from "../api/category.api";
import { Player, PlayerFilters, CreatePlayerDto } from "../types/player.types";
import { Team } from "../types/team.types";
import { Category } from "../types/category.types";
import { PlayerForm } from "../components/PlayerForm";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Pagination } from "@/components/ui/Pagination";
import { LimitSelector } from "@/components/ui/LimitSelector";
import { BaseTable } from "@/components/ui/Table";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useSearchParams, useNavigate } from "react-router-dom";

export const PlayersTab = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialTeamId = searchParams.get("teamId");
  const initialCategoryId = searchParams.get("categoryId");

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
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
      const [playersData, teamsData, categoriesData] = await Promise.all([
        playerApi.getPlayers(
          {
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search,
            teamId: filters.teamId,
            categoryId: filters.categoryId,
            active: filters.active,
          },
          { silent }
        ),
        teamApi.getTeams({ limit: 100 }, { silent }), // For team filter & selection
        categoryApi.getCategories({ limit: 100 }, { silent }), // For category selection
      ]);
      setPlayers(playersData.data || []);
      setPagination((prev) => ({ ...prev, ...playersData.meta }));
      setTeams(teamsData.data || []);
      setCategories(categoriesData.data || []);
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

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTeamFilter = (teamId: string) => {
    setFilters((prev) => ({
      ...prev,
      teamId: teamId ? Number(teamId) : undefined,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: categoryId ? Number(categoryId) : undefined,
      teamId: undefined, // Reset team when category changes
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters({
      search: "",
      teamId: undefined,
      categoryId: undefined,
      active: undefined,
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    navigate(window.location.pathname, { replace: true });
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
      key: "dni",
      label: "DNI",
      width: "110px",
      sortable: true,
      sortValue: (r: Player) => r.dni,
    },
    {
      key: "name",
      label: "Jugador",
      width: "200px",
      sortable: true,
      sortValue: (r: Player) => `${r.name} ${r.lastname || ""}`,
    },
    {
      key: "number",
      label: "N°",
      width: "60px",
      sortable: true,
      sortValue: (r: Player) => r.number || 0,
    },
    {
      key: "team",
      label: "Equipo",
      width: "150px",
      sortable: true,
      sortValue: (r: Player) => r.team?.name || "",
    },
    {
      key: "category",
      label: "Categoría",
      width: "130px",
      sortable: true,
      sortValue: (r: Player) => r.category?.name || "",
    },
    { key: "status", label: "Estado", width: "100px" },
    { key: "actions", label: "Acciones", width: "100px" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Jugadores
          </h2>
          <p className="text-text-muted text-sm">
            Gestiona la nómina de jugadores de todos los equipos.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={teams.length === 0}
          className="gap-2 shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Jugador</span>
        </Button>
      </div>

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 sm:max-w-xs">
              <Input
                placeholder="Buscar por DNI o nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pr-10"
              />
              {searchInput && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleClearSearch}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-text h-8 w-8 p-0"
                >
                  x
                </Button>
              )}
            </div>

            <div className="relative flex items-center min-w-[180px]">
              <div className="absolute left-3 text-text-muted pointer-events-none">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={filters.categoryId || ""}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:ring-2 focus:ring-primary/30 outline-none appearance-none cursor-pointer text-sm font-medium"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex items-center min-w-[180px]">
              <div className="absolute left-3 text-text-muted pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
              <select
                value={filters.teamId || ""}
                onChange={(e) => handleTeamFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-border focus:ring-2 focus:ring-primary/30 outline-none appearance-none cursor-pointer text-sm font-medium"
              >
                <option value="">Todos los equipos</option>
                {teams
                  .filter((t) =>
                    filters.categoryId
                      ? t.categoryId === filters.categoryId
                      : true
                  )
                  .map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSearch}
                variant="secondary"
                className="gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Buscar</span>
              </Button>
              {(filters.search || filters.teamId || filters.categoryId) && (
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  className="text-text-muted hover:text-red-500 gap-2"
                  title="Limpiar filtros"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden lg:inline">Limpiar</span>
                </Button>
              )}
            </div>
          </div>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <InlineSpinner label="Cargando jugadores..." size={40} />
        </div>
      ) : players.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <LimitSelector
              value={pagination.limit}
              onChange={(limit) =>
                setPagination((prev) => ({ ...prev, limit, page: 1 }))
              }
            />
          </div>

          <BaseTable
            columns={columns}
            data={players}
            renderRow={(player: Player) => [
              <div className="w-10 h-10 rounded-full bg-surface border border-border overflow-hidden">
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
              <span className="font-mono text-sm">{player.dni}</span>,
              <div className="flex flex-col">
                <span className="font-bold text-text">
                  {player.name} {player.lastname}
                </span>
                {player.birthDate && (
                  <span className="text-xs text-text-muted">
                    {formatDateForDisplay(player.birthDate)}
                  </span>
                )}
              </div>,
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 text-primary font-black">
                {player.number || "-"}
              </div>,
              <span className="text-sm font-medium">
                {player.team?.name || "Sin equipo"}
              </span>,
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {player.category?.name || "-"}
              </span>,
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  player.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {player.isActive ? "Activo" : "Inactivo"}
              </div>,
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(player)}
                  className="text-primary hover:bg-primary/10 border-primary/20"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setDeleteDni(player.dni)}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>,
            ]}
            renderMobileRow={(player: Player) => (
              <div className="space-y-4">
                {/* Header con foto, nombre y acciones */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-border overflow-hidden bg-surface flex-shrink-0">
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
                    <p className="text-xs text-text-muted">DNI: {player.dni}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEdit(player)}
                      className="text-primary bg-primary/5 hover:bg-primary/10 border-primary/20"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteDni(player.dni)}
                      className="flex-1 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Información en formato label: valor con grid responsivo */}
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 pt-2 border-t border-border text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted min-w-[70px]">
                      Número:
                    </span>
                    <span className="font-black text-primary">
                      #{player.number || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-text-muted min-w-[70px]">
                      Equipo:
                    </span>
                    <span className="text-text font-medium truncate">
                      {player.team?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-text-muted min-w-[70px]">
                      Categoría:
                    </span>
                    <span className="text-text font-medium truncate">
                      {player.category?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-text-muted min-w-[70px]">
                      Estado:
                    </span>
                    <span
                      className={`font-medium ${
                        player.isActive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {player.isActive ? "Activo" : "Inactivo"}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <p className="text-sm text-text-muted">
              Mostrando {players.length} de {pagination.total} jugadores
            </p>
            {pagination.totalPages > 1 && (
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border border-dashed rounded-[2rem]">
          <div className="w-24 h-24 rounded-full bg-primary-soft flex items-center justify-center mb-6">
            <UserSearch className="w-12 h-12 text-primary opacity-30" />
          </div>
          <p className="text-text font-bold text-2xl">
            No se encontraron jugadores
          </p>
          <p className="text-text-muted text-center max-w-sm">
            {filters.search || filters.teamId
              ? "Prueba ajustando los filtros o realiza una nueva búsqueda."
              : "Empieza registrando jugadores en tus equipos."}
          </p>
        </div>
      )}

      {teams.length > 0 && (
        <PlayerForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingPlayer}
          teams={teams}
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
    </div>
  );
};
