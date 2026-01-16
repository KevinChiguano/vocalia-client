import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save } from "lucide-react";
import { CreateLeagueDto, League } from "../types/league.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const leagueSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  imageUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().optional(),
});

type LeagueFormData = z.infer<typeof leagueSchema>;

interface Props {
  initialData?: League | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeagueDto) => Promise<void>;
  isLoading?: boolean;
}

export const LeagueForm = ({
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
  } = useForm<LeagueFormData>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        imageUrl: initialData?.imageUrl || "",
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
      <div className="w-full max-w-md ui-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
          <h2 className="type-h3 font-bold text-primary">
            {initialData ? "Editar Liga" : "Nueva Liga"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-text hover:bg-hover rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="Nombre de la Liga"
            placeholder="Ej: Liga barrial 2024"
            error={errors.name?.message}
            {...register("name")}
            autoFocus
          />

          <Input
            label="URL de Imagen (Opcional)"
            placeholder="https://..."
            error={errors.imageUrl?.message}
            {...register("imageUrl")}
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              className="w-4 h-4 text-primary rounded border-border focus:ring-2 focus:ring-primary/30"
              {...register("isActive")}
            />
            <label htmlFor="isActive" className="ui-label">
              Liga Activa
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
