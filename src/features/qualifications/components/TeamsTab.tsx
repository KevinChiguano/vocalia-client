import { useEffect, useState } from "react";
import { Plus, Search, X, Shield, Filter, Users } from "lucide-react";
import { teamApi } from "../api/team.api";
import { categoryApi } from "../api/category.api";
import { Team, TeamFilters, CreateTeamDto } from "../types/team.types";
import { Category } from "../types/category.types";
import { TeamCard } from "../components/TeamCard";
import { TeamForm } from "../components/TeamForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Select } from "@/components/ui/Select";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export const TeamsTab = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<TeamFilters>({
    search: "",
    category: "",
    active: undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [teamsData, categoriesData] = await Promise.all([
        teamApi.getTeams(
          {
            page: pagination.page,
            limit: pagination.limit,
            search: filters.search,
            category: filters.category,
            active: filters.active,
          },
          { silent },
        ),
        categoryApi.getCategories({ limit: 100 }, { silent }), // Get all categories for filter
      ]);
      setTeams(teamsData.data || []);
      setPagination((prev) => ({ ...prev, ...teamsData.meta }));
      setCategories(categoriesData.data || []);
    } catch (error: any) {
      console.error("Error fetching teams/categories", error);
      setTeams([]);
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
    filters.category,
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

  const handleCategoryFilter = (catId: string) => {
    setFilters((prev) => ({ ...prev, category: catId }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreate = () => {
    setEditingTeam(null);
    setIsFormOpen(true);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await teamApi.deleteTeam(deleteId);
      setDeleteId(null);
      fetchData();
    }
  };

  const handleFormSubmit = async (data: CreateTeamDto) => {
    setFormLoading(true);
    try {
      if (editingTeam) {
        await teamApi.updateTeam(editingTeam.id, data);
      } else {
        await teamApi.createTeam(data);
      }
      // Esperar a que los datos se actualicen antes de cerrar el modal
      // Esto mantiene el spinner activo (si la petición no es silenciosa)
      // o mantiene la UI coherente.
      await fetchData(false);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Equipos
          </h2>
          <p className="text-text-muted text-sm">
            Gestiona los equipos inscritos y sus categorías.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={categories.length === 0}
          className="gap-2 shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Equipo</span>
        </Button>
      </div>

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 sm:max-w-xs">
              <Input
                placeholder="Buscar equipo..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pr-10"
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

            <div className="min-w-[200px]">
              <Select
                icon={<Filter className="w-4 h-4" />}
                value={filters.category}
                onChange={(e) => handleCategoryFilter(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              onClick={handleSearch}
              variant="secondary"
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Button>
          </div>
        }
      />

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-text-muted px-1">
          <span>
            Mostrando {teams.length} de {pagination.total} equipos
            {pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {teams.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-8">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={(page) =>
                  setPagination((prev) => ({ ...prev, page }))
                }
              />
            </div>
          )}
        </>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border border-dashed rounded-4xl">
            <div className="w-24 h-24 rounded-full bg-primary-soft flex items-center justify-center mb-6">
              <Shield className="w-12 h-12 text-primary opacity-30" />
            </div>
            <p className="text-text font-bold text-2xl">
              No se encontraron equipos
            </p>
            <p className="text-text-muted">
              Empieza registrando un equipo en una categoría.
            </p>
          </div>
        )
      )}

      {categories.length > 0 && (
        <TeamForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={editingTeam}
          categories={categories}
          isLoading={formLoading}
        />
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Equipo"
        description="Esta acción eliminará permanentemente al equipo del sistema. ¿Deseas continuar?"
        danger
      />
    </div>
  );
};
