import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save } from "lucide-react";
import { Category, CreateCategoryDto } from "../types/category.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

const categorySchema = z.object({
  name: z.string().min(1, "El nombre de la categoría es requerido").max(100),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Props {
  initialData?: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryDto) => Promise<void>;
  isLoading?: boolean;
}

export const CategoryForm = ({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        description: initialData?.description || "",
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md ui-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
          <h2 className="type-h3 font-bold text-primary">
            {initialData ? "Editar Categoría" : "Nueva Categoría"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text hover:bg-hover rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((data) =>
            onSubmit(data as unknown as CreateCategoryDto),
          )}
          className="p-6 space-y-5"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name" className="ui-label">
              Nombre de la Categoría
            </Label>
            <Input
              id="name"
              placeholder="Ej: Senior, Juvenil, Femenino"
              {...register("name")}
              autoFocus
            />
            {errors.name?.message && (
              <p className="text-xs text-danger font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="ui-label">Descripción (Opcional)</label>
            <textarea
              className={`w-full min-h-[100px] px-4 py-3 rounded-lg bg-surface border ${
                errors.description ? "border-red-500" : "border-border"
              } focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-text resize-none`}
              placeholder="Descripción breve de la categoría..."
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="isActive"
              className="w-5 h-5 text-primary rounded border-border focus:ring-2 focus:ring-primary/30 cursor-pointer"
              {...register("isActive")}
            />
            <label
              htmlFor="isActive"
              className="ui-label cursor-pointer select-none"
            >
              Categoría Activa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 min-w-[120px]"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
