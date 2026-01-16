import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import { tournamentApi } from "../api/tournament.api";
import { Tournament, TournamentFilters } from "../types/tournament.types";
import { TournamentCard } from "../components/TournamentCard";
import { TournamentForm } from "../components/TournamentForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TournamentTeamsModal } from "../components/TournamentTeamsModal";

export const TournamentsPage = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const id = Number(leagueId);

  // State
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");

  const [filters, setFilters] = useState<TournamentFilters>({
    search: "",
    active: undefined,
    leagueId: id, // Siempre filtra por el leagueId de la ruta
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isTeamsModalOpen, setIsTeamsModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] =
    useState<Tournament | null>(null);

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
  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const data = await tournamentApi.getTournamentsByLeague({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        active: filters.active,
        leagueId: id, // Siempre incluye el leagueId de la ruta
      });
      setTournaments(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.meta }));
    } catch (error: any) {
      console.error("Error fetching tournaments", error);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, [pagination.page, pagination.limit, filters.search, filters.active, id]);

  // Handlers
  const handleCreate = () => {
    setEditingTournament(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (tournamentId: number) => {
    setDeleteId(tournamentId);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await tournamentApi.deleteTournament(deleteId);
        setDeleteId(null);
        fetchTournaments();
      } catch (error: any) {
        console.error("Error deleting tournament", error);
      }
    }
  };

  const handleManageTeams = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setIsTeamsModalOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchTournaments();
  };

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="type-h2 font-bold text-text">Torneos</h1>
          <p className="type-sm sm:type-body text-text-muted">
            Gestiona los torneos de esta liga
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Nuevo Torneo</span>
        </Button>
      </div>

      {/* Filters */}
      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1 sm:flex-initial">
              <Input
                placeholder="Buscar torneos..."
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
            Mostrando {tournaments.length} de {pagination.total} torneo
            {pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Content */}
      {Array.isArray(tournaments) && tournaments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onManageTeams={handleManageTeams}
              />
            ))}
          </div>

          {/* Pagination */}
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
                <p className="text-text font-medium">
                  No se encontraron torneos
                </p>
                <p className="text-text-muted text-sm">
                  {filters.search
                    ? "Intenta ajustar tu búsqueda"
                    : "Comienza creando tu primer torneo"}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* Modals */}
      <TournamentForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        leagueId={id}
        tournamentToEdit={editingTournament}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Torneo"
        description="¿Estás seguro de que deseas eliminar este torneo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        danger
      />

      {selectedTournament && (
        <TournamentTeamsModal
          isOpen={isTeamsModalOpen}
          onClose={() => setIsTeamsModalOpen(false)}
          tournamentId={selectedTournament.id}
          tournamentName={selectedTournament.name}
        />
      )}
    </div>
  );
};
