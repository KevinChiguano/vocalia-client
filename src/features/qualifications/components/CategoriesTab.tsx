import { useEffect, useState } from "react";
import { Plus, Search, X, Tag } from "lucide-react";
import { categoryApi } from "../api/category.api";
import {
  Category,
  CategoryFilters,
  CreateCategoryDto,
} from "../types/category.types";
import { CategoryCard } from "../components/CategoryCard";
import { CategoryForm } from "../components/CategoryForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Pagination } from "@/components/ui/Pagination";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export const CategoriesTab = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<CategoryFilters>({
    search: "",
    active: undefined,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryApi.getCategories({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        active: filters.active,
      });
      setCategories(data.data || []);
      setPagination((prev) => ({ ...prev, ...data.meta }));
    } catch (error: any) {
      console.error("Error fetching categories", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, pagination.limit, filters.search, filters.active]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "" }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await categoryApi.deleteCategory(deleteId);
      setDeleteId(null);
      fetchCategories();
    }
  };

  const handleFormSubmit = async (data: CreateCategoryDto) => {
    if (editingCategory) {
      await categoryApi.updateCategory(editingCategory.id, data);
    } else {
      await categoryApi.createCategory(data);
    }
    setIsFormOpen(false);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <Tag className="w-6 h-6 text-primary" />
            Categorías
          </h2>
          <p className="text-text-muted text-sm">
            Gestiona las categorías de juego para los equipos.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </Button>
      </div>

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Input
                placeholder="Buscar por nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full sm:w-80 pr-10"
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
            Mostrando {categories.length} de {pagination.total} categorias
            {pagination.total !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {categories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onEdit={handleEdit}
                onDelete={setDeleteId}
              />
            ))}{" "}
          </div>
          {pagination.totalPages > 1 && (
            <div className="flex justify-center pt-4">
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
          <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mb-4">
              <Tag className="w-10 h-10 text-primary opacity-30" />
            </div>
            <p className="text-text font-bold text-xl">
              No se encontraron categorías
            </p>
            <p className="text-text-muted">
              Intenta con otro filtro o crea una nueva.
            </p>
          </div>
        )
      )}

      <CategoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingCategory}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        description="¿Estás seguro de que deseas eliminar esta categoría? Los equipos asociados podrían verse afectados."
        danger
      />
    </div>
  );
};
