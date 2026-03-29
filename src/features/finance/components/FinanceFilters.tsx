import { FiltersBar } from "@/components/ui/FiltersBar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { tournamentApi } from "@/features/administration/api/tournament.api";
import { Tournament } from "@/features/administration/types/tournament.types";
import { categoryApi } from "@/features/qualifications/api/category.api";
import { Category } from "@/features/qualifications/types/category.types";

interface FinanceFiltersProps {
  searchValue: string;
  startDateValue: string | undefined;
  endDateValue: string | undefined;
  onApplyFilters: (filters: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  tournamentId: number | undefined;
  onTournamentChange: (val: number | undefined) => void;
  categoryId: string | undefined;
  onCategoryChange: (val: string | undefined) => void;
}

export const FinanceFilters = ({
  searchValue,
  startDateValue,
  endDateValue,
  onApplyFilters,
  tournamentId,
  onTournamentChange,
  categoryId,
  onCategoryChange,
}: FinanceFiltersProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Local state for the inputs before applying
  const [tempSearch, setTempSearch] = useState(searchValue);
  const [tempStartDate, setTempStartDate] = useState(startDateValue || "");
  const [tempEndDate, setTempEndDate] = useState(endDateValue || "");

  // Update local state when external props change (e.g. on clear)
  useEffect(() => {
    setTempSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    setTempStartDate(startDateValue || "");
    setTempEndDate(endDateValue || "");
  }, [startDateValue, endDateValue]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [tournamentsRes, categoriesRes] = await Promise.all([
          tournamentApi.getTournaments({ page: 1, limit: 100 }),
          categoryApi.getCategories({ page: 1, limit: 100 }),
        ]);
        setTournaments(tournamentsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error("Error loading filter data", error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleApply = () => {
    onApplyFilters({
      search: tempSearch,
      startDate: tempStartDate || undefined,
      endDate: tempEndDate || undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  const handleClear = () => {
    setTempSearch("");
    setTempStartDate("");
    setTempEndDate("");
    onApplyFilters({
      search: "",
      startDate: undefined,
      endDate: undefined,
    });
    // Also reset dropdowns
    onTournamentChange(undefined);
    onCategoryChange(undefined);
  };

  return (
    <div className="mb-6">
      <FiltersBar
        left={
          <div className="flex flex-col lg:flex-row gap-3 w-full flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <Search className="w-4 h-4" />
              </div>
              <Input
                placeholder="Buscar por equipo o partido (Enter)..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pr-10"
              />
              {tempSearch && (
                <Button
                  variant="ghost"
                  size="xs"
                  isIconOnly
                  onClick={() => setTempSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Tournaments Select */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <Select
                value={tournamentId || ""}
                onChange={(e) =>
                  onTournamentChange(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
              >
                <option value="">Todos los torneos</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Categories Select */}
            <div className="w-full sm:w-auto min-w-[200px]">
              <Select
                value={categoryId || ""}
                onChange={(e) => onCategoryChange(e.target.value || undefined)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="relative flex-1 sm:w-40">
                <Input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full"
                />
                <span className="absolute -top-2 left-2 bg-surface px-1 text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  Inicio
                </span>
              </div>
              <div className="text-text-muted font-bold">-</div>
              <div className="relative flex-1 sm:w-40">
                <Input
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                  className="w-full"
                />
                <span className="absolute -top-2 left-2 bg-surface px-1 text-[10px] text-text-muted uppercase font-bold tracking-wider">
                  Fin
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="primary"
                onClick={handleApply}
                className="gap-2 flex-1 sm:flex-none shadow-md"
              >
                <Search className="w-4 h-4" />
                <span>Filtrar</span>
              </Button>
              {(tempSearch ||
                tempStartDate ||
                tempEndDate ||
                tournamentId ||
                categoryId) && (
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="gap-2 bg-surface text-text-muted hover:text-danger hover:border-danger/30"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Limpiar</span>
                </Button>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
};
