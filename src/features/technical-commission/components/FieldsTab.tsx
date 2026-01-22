import { useEffect, useState } from "react";
import { Plus, Search, X, MapPin } from "lucide-react";
import { fieldApi } from "../api/field.api";
import { Field, CreateFieldDto } from "../types/field.types";
import { FieldCard } from "./FieldCard";
import { FieldForm } from "./FieldForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export const FieldsTab = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const data = await fieldApi.getFields();
      setFields(data || []);
    } catch (error) {
      console.error("Error fetching fields", error);
      setFields([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleCreate = () => {
    setEditingField(null);
    setIsFormOpen(true);
  };

  const handleEdit = (field: Field) => {
    setEditingField(field);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      try {
        await fieldApi.deleteField(deleteId);
        setDeleteId(null);
        fetchFields();
      } catch (error) {
        console.error("Error deleting field", error);
      }
    }
  };

  const handleFormSubmit = async (data: CreateFieldDto) => {
    try {
      if (editingField) {
        await fieldApi.updateField(editingField.field_id, data);
      } else {
        await fieldApi.createField(data);
      }
      setIsFormOpen(false);
      fetchFields();
    } catch (error) {
      console.error("Error saving field", error);
    }
  };

  const filteredFields = fields.filter((f) =>
    f.name.toLowerCase().includes(searchInput.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-text flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            Canchas
          </h2>
          <p className="text-text-muted text-sm">
            Gestiona las canchas disponibles para los encuentros deportivos.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="gap-2 shadow-lg hover:shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cancha</span>
        </Button>
      </div>

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Input
                placeholder="Buscar cancha por nombre..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full sm:w-80 pr-10"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button onClick={() => {}} variant="secondary" className="gap-2">
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
            Mostrando {filteredFields.length} de {fields.length} canchas
          </span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 ui-card animate-pulse bg-surface/50" />
          ))}
        </div>
      ) : filteredFields.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFields.map((field) => (
            <FieldCard
              key={field.field_id}
              field={field}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-surface/50 border border-border border-dashed rounded-3xl">
          <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mb-4">
            <MapPin className="w-10 h-10 text-primary opacity-30" />
          </div>
          <p className="text-text font-bold text-xl">
            No se encontraron canchas
          </p>
          <p className="text-text-muted">
            Intenta con otro filtro o crea una nueva.
          </p>
        </div>
      )}

      <FieldForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingField}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cancha"
        description="¿Estás seguro de que deseas eliminar esta cancha? Esta acción no se puede deshacer."
        danger
      />
    </div>
  );
};
