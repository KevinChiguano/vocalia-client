import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, Image as ImageIcon } from "lucide-react";
import { Team, CreateTeamDto } from "../types/team.types";
import { Category } from "../types/category.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";

const teamSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre del equipo debe tener al menos 3 caracteres")
    .max(100),
  logo: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  categoryId: z.coerce
    .number()
    .int()
    .positive("Debes seleccionar una categoría"),
  isActive: z.boolean(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface Props {
  initialData?: Team | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTeamDto) => Promise<void>;
  isLoading?: boolean;
}

export const TeamForm = ({
  initialData,
  categories,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema) as any,
    defaultValues: {
      name: "",
      logo: "",
      categoryId: 1,
      isActive: true,
    },
  });

  const logoUrl = watch("logo");

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        logo: initialData?.logo || "",
        categoryId:
          initialData?.categoryId ||
          (categories.length > 0 ? categories[0].id : 0),
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [initialData, isOpen, reset, categories]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Equipo" : "Nuevo Equipo"}
      maxWidth="lg"
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit(data as unknown as CreateTeamDto),
        )}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo Preview */}
          <div className="flex flex-col items-center gap-3">
            <label className="ui-label self-start">Logo</label>
            <div className="w-32 h-32 rounded-2xl bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden">
              {logoUrl && !errors.logo ? (
                <img
                  src={logoUrl}
                  alt="Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="w-10 h-10 opacity-20" />
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="ui-label">
                Nombre del Equipo
              </Label>
              <Input
                id="name"
                placeholder="Ej: Los Galácticos FC"
                {...register("name")}
              />
              {errors.name?.message && (
                <p className="text-xs text-danger font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo" className="ui-label">
                URL del Logo (Opcional)
              </Label>
              <Input
                id="logo"
                placeholder="https://ejemplo.com/logo.png"
                {...register("logo")}
              />
              {errors.logo?.message && (
                <p className="text-xs text-danger font-medium">
                  {errors.logo.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Select
              label="Categoría (Obligatorio)"
              id="categoryId"
              error={errors.categoryId?.message}
              {...register("categoryId", { valueAsNumber: true })}
            >
              <option value={0} disabled>
                Selecciona una categoría
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <Checkbox id="isActive" {...register("isActive")} />
            <label
              htmlFor="isActive"
              className="ui-label cursor-pointer select-none"
            >
              Equipo Activo
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="gap-2 min-w-[140px] shadow-lg shadow-primary/20 relative"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Equipo</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
