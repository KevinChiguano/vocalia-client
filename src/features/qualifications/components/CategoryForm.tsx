import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save } from "lucide-react";
import { Category, CreateCategoryDto } from "../types/category.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Categoría" : "Nueva Categoría"}
      maxWidth="md"
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit(data as unknown as CreateCategoryDto),
        )}
        className="space-y-5"
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
          <Textarea
            className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
            placeholder="Descripción breve de la categoría..."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Checkbox id="isActive" {...register("isActive")} />
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
    </Modal>
  );
};
