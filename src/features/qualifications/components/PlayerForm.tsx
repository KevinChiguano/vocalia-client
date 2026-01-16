import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Save,
  User,
  Hash,
  CreditCard,
  Calendar,
  Image as ImageIcon,
} from "lucide-react";
import { Player, CreatePlayerDto } from "../types/player.types";
import { Team } from "../types/team.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Category } from "../types/category.types";
import { formatDateForInput } from "@/utils/dateUtils";

const playerSchema = z.object({
  dni: z
    .string()
    .min(5, "El DNI debe tener al menos 5 caracteres")
    .max(15, "El DNI no puede superar los 15 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  lastname: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50)
    .optional()
    .or(z.literal("")),
  number: z.coerce
    .number()
    .int()
    .min(1, "El número debe ser mayor a 0")
    .max(99, "El número no puede superar 99")
    .optional(),
  teamId: z.coerce.number().int().positive("Debes seleccionar un equipo"),
  birthDate: z.string().optional().or(z.literal("")),
  imageUrl: z
    .string()
    .url("Debe ser una URL válida")
    .optional()
    .or(z.literal("")),
  categoryId: z.coerce
    .number()
    .int()
    .positive("Debes seleccionar una categoría"),
  isActive: z.boolean(),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface Props {
  initialData?: Player | null;
  teams: Team[];
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePlayerDto) => Promise<void>;
  isLoading?: boolean;
}

export const PlayerForm = ({
  initialData,
  teams,
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
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema) as any,
    defaultValues: {
      dni: "",
      name: "",
      lastname: "",
      number: undefined,
      teamId: 0,
      categoryId: 0,
      birthDate: "",
      imageUrl: "",
      isActive: true,
    },
  });

  const imageUrl = watch("imageUrl");

  useEffect(() => {
    if (isOpen) {
      reset({
        dni: initialData?.dni || "",
        name: initialData?.name || "",
        lastname: initialData?.lastname || "",
        number: initialData?.number,
        teamId: initialData?.teamId || (teams.length > 0 ? teams[0].id : 0),
        categoryId:
          initialData?.categoryId ||
          (categories.length > 0 ? categories[0].id : 0),
        birthDate: formatDateForInput(initialData?.birthDate),
        imageUrl: initialData?.imageUrl || "",
        isActive: initialData?.isActive ?? true,
      });
    }
  }, [initialData, isOpen, reset, teams, categories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-overlay backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl ui-card overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="type-h3 font-bold text-primary">
              {initialData ? "Editar Jugador" : "Nuevo Jugador"}
            </h2>
          </div>
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
            onSubmit(data as unknown as CreatePlayerDto)
          )}
          className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Preview */}
            <div className="flex flex-col items-center gap-3">
              <label className="ui-label self-start">Foto del Jugador</label>
              <div className="w-32 h-40 rounded-2xl bg-surface border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group">
                {imageUrl && !errors.imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-10 h-10 opacity-20" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white font-medium text-center px-2">
                    Vista Previa
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre"
                  placeholder="Ej: Kevin"
                  error={errors.name?.message}
                  {...register("name")}
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="Apellido"
                  placeholder="Ej: Chiguano"
                  error={errors.lastname?.message}
                  {...register("lastname")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="DNI"
                  placeholder="1723456789"
                  error={errors.dni?.message}
                  disabled={!!initialData}
                  {...register("dni")}
                  leftIcon={<CreditCard className="w-4 h-4" />}
                />
                <Input
                  label="Número de Camiseta"
                  type="number"
                  placeholder="10"
                  error={errors.number?.message}
                  {...register("number")}
                  leftIcon={<Hash className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="ui-label">
                Categoría (Obligatorio)
              </label>
              <div className="relative">
                <select
                  id="categoryId"
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${
                    errors.categoryId ? "border-red-500" : "border-border"
                  } focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-text appearance-none cursor-pointer`}
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
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <X className="w-4 h-4 rotate-45" />
                </div>
              </div>
              {errors.categoryId && (
                <p className="text-xs text-red-500">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="teamId" className="ui-label">
                Equipo (Obligatorio)
              </label>
              <div className="relative">
                <select
                  id="teamId"
                  className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${
                    errors.teamId ? "border-red-500" : "border-border"
                  } focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-text appearance-none cursor-pointer`}
                  {...register("teamId", { valueAsNumber: true })}
                >
                  <option value={0} disabled>
                    Selecciona un equipo
                  </option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                  <X className="w-4 h-4 rotate-45" />
                </div>
              </div>
              {errors.teamId && (
                <p className="text-xs text-red-500">{errors.teamId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Nacimiento"
              type="date"
              error={errors.birthDate?.message}
              {...register("birthDate")}
              leftIcon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label="URL de la Imagen"
              placeholder="https://ejemplo.com/jugador.png"
              error={errors.imageUrl?.message}
              {...register("imageUrl")}
              leftIcon={<ImageIcon className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
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
              Jugador Activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="px-6"
            >
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
                  <span>Guardar Jugador</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
