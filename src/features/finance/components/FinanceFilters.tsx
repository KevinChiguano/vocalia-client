import { FiltersBar } from "@/components/ui/FiltersBar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Search, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { tournamentApi } from "@/features/administration/api/tournament.api";
import { Tournament } from "@/features/administration/types/tournament.types";
import { categoryApi } from "@/features/qualifications/api/category.api";
import { Category } from "@/features/qualifications/types/category.types";

interface FinanceFiltersProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  tournamentId: number | undefined;
  onTournamentChange: (val: number | undefined) => void;
  categoryId: string | undefined;
  onCategoryChange: (val: string | undefined) => void;
}

export const FinanceFilters = ({
  searchValue,
  onSearchChange,
  tournamentId,
  onTournamentChange,
  categoryId,
  onCategoryChange,
}: FinanceFiltersProps) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

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

  const handleClearSearch = () => {
    onSearchChange("");
  };

  return (
    <div className="mb-6">
      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-3 w-full flex-wrap xl:flex-nowrap">
            <div className="relative flex-1 sm:min-w-[250px] xl:max-w-md">
              <Input
                placeholder="Buscar por equipo o partido..."
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pr-10"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="xs"
                  isIconOnly
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="w-full sm:w-auto min-w-[180px]">
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

            <div className="w-full sm:w-auto min-w-[160px]">
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

            <div className="relative w-full sm:w-auto min-w-[180px]">
              <Input
                type="text"
                placeholder="Oct 01 - Oct 31"
                className="pr-10"
              />
              <Calendar className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <Button variant="secondary" className="gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Button>
          </div>
        }
      />
    </div>
  );
};
