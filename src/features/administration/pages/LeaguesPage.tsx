import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { leagueApi } from "../api/league.api";
import { CreateLeagueDto, League, LeagueFilters } from "../types/league.types";
import { LeagueCard } from "../components/LeagueCard";
import { LeagueForm } from "../components/LeagueForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export const LeaguesPage = () => {
  // State
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<LeagueFilters>({
    search: "",
    active: undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchInput.trim(),
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({
      ...prev,
      search: "",
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Fetch Data
  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const data = await leagueApi.getLeagues({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        active: filters.active,
      });
      setLeagues(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.meta }));
    } catch (error: any) {
      console.error("Error fetching leagues", error);
      setLeagues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [pagination.page, pagination.limit, filters.search, filters.active]);

  // Handlers
  const handleCreate = () => {
    setEditingLeague(null);
    setIsFormOpen(true);
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await leagueApi.deleteLeague(deleteId);
        setDeleteId(null);
        fetchLeagues();
      } catch (error: any) {
        console.error("Error deleting league", error);
      }
    }
  };

  const handleFormSubmit = async (data: CreateLeagueDto) => {
    try {
      if (editingLeague) {
        await leagueApi.updateLeague(editingLeague.id, data);
      } else {
        await leagueApi.createLeague(data);
      }
      setIsFormOpen(false);
      fetchLeagues();
    } catch (error: any) {
      console.error("Error saving league", error);
    }
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="type-h2 font-bold text-text">Ligas</h1>
          <p className="type-sm sm:type-body text-text-muted">
            Gestiona las ligas deportivas registradas en el sistema.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Nueva Liga</span>
        </Button>
      </div>

      {/* Filters */}
      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Buscar ligas..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full sm:w-64 pr-8"
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-hover rounded-md transition-colors"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-4 h-4 text-text-muted" />
                </button>
              )}
            </div>

            <Button onClick={handleSearch} className="gap-2 w-full sm:w-auto">
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
            Mostrando {leagues.length} de {pagination.total} liga
            {pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Content */}
      {Array.isArray(leagues) && leagues.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={league}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>

          {/* Pagination - Ahora centrada y más visible */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-4 sm:pt-6">
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
          <div className="text-center py-16 sm:py-20 bg-surface rounded-xl border border-border border-dashed">
            <div className="flex flex-col items-center gap-3 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-soft flex items-center justify-center">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-primary opacity-50" />
              </div>
              <div className="space-y-1">
                <p className="text-text font-medium">No se encontraron ligas</p>
                <p className="text-text-muted text-sm">
                  {filters.search
                    ? "Intenta ajustar tu búsqueda"
                    : "Comienza creando tu primera liga"}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Modals */}
      <LeagueForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingLeague}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Liga"
        description="¿Estás seguro de que deseas eliminar esta liga? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};
