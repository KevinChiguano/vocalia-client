import { useEffect, useState } from "react";
import { Plus, Search, X, Shield, Upload, PlusCircle } from "lucide-react";
import { teamApi } from "../api/team.api";
import { categoryApi } from "../api/category.api";
import { Team, TeamFilters, CreateTeamDto } from "../types/team.types";
import { Category } from "../types/category.types";
import { TeamCard } from "../components/TeamCard";
import { TeamForm } from "../components/TeamForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PaginationFooter } from "@/components/ui/PaginationFooter";
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
      {/* Page Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Gestión de Equipos
          </h1>
          <p className="text-text-muted mt-1">
            Administra los clubes, categorías y nóminas oficiales de la liga.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" className="gap-2">
            <Upload className="w-5 h-5" />
            <span>Importación Masiva</span>
          </Button>
          <Button
            onClick={handleCreate}
            disabled={categories.length === 0}
            className="gap-2 shadow-lg hover:shadow-primary/20"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nuevo Equipo</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col xl:flex-row justify-between gap-4 mb-2">
        {/* Component for categories */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 w-full xl:w-auto flex-1">
          <button
            onClick={() => handleCategoryFilter("")}
            className={`flex items-center justify-center min-w-max gap-2 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors border ${
              filters.category === ""
                ? "bg-primary text-white border-primary"
                : "bg-surface hover:bg-primary/10 text-text-muted hover:text-primary border-border"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id.toString())}
              className={`flex items-center justify-center min-w-max gap-2 px-4 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-colors border ${
                filters.category === cat.id.toString()
                  ? "bg-primary text-white border-primary"
                  : "bg-surface hover:bg-primary/10 text-text-muted hover:text-primary border-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Component for search */}
        <div className="flex items-center gap-2 w-full xl:w-auto shrink-0 pb-2">
          <span className="text-xs font-semibold text-text-muted uppercase tracking-widest whitespace-nowrap hidden sm:inline-block">
            Buscar:
          </span>
          <div className="relative flex-1 sm:flex-none">
            <Input
              placeholder="Buscar equipo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full sm:w-64 h-9 text-sm"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSearch}
            variant="secondary"
            className="h-9"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {teams.length > 0 || filters.search || filters.category ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}
            {/* Add New Card Placeholder */}
            <button
              onClick={handleCreate}
              disabled={categories.length === 0}
              className="group flex flex-col items-center justify-center p-8 bg-surface/50 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[300px] h-full"
            >
              <div className="w-14 h-14 rounded-full bg-elevated flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all shadow-soft group-hover:shadow-primary/20">
                <Plus className="w-8 h-8" />
              </div>
              <span className="font-bold text-text-muted group-hover:text-primary transition-colors text-lg">
                Crear Nuevo Equipo
              </span>
              <p className="text-sm text-text-muted mt-2 text-center max-w-[200px]">
                Registra un nuevo club y asigna su categoría
              </p>
            </button>
          </div>

          <PaginationFooter
            currentCount={teams.length}
            totalCount={pagination.total}
            itemName="equipos"
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
            className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-border/50 pt-6 gap-4"
          />
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
            <p className="text-text-muted mt-2">
              Empieza registrando un equipo en una categoría.
            </p>
            <Button
              onClick={handleCreate}
              disabled={categories.length === 0}
              className="mt-6 gap-2"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Crear mi primer equipo</span>
            </Button>
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
