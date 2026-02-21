import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
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
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Category } from "../types/category.types";
import { formatDateForInput } from "@/utils/dateUtils";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Jugador" : "Nuevo Jugador"}
      maxWidth="2xl"
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit(data as unknown as CreatePlayerDto),
        )}
        className="space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar"
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

          {/* Basic Info & Identification Wrapper */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="ui-label">
                  Nombre
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="name"
                    placeholder="Ej: Marco"
                    className=""
                    {...register("name")}
                  />
                </div>
                {errors.name?.message && (
                  <p className="text-xs text-danger font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lastname" className="ui-label">
                  Apellido
                </Label>
                <Input
                  id="lastname"
                  placeholder="Ej: Velez"
                  {...register("lastname")}
                />
                {errors.lastname?.message && (
                  <p className="text-xs text-danger font-medium">
                    {errors.lastname.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="dni" className="ui-label">
                  DNI
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <Input
                    id="dni"
                    placeholder="1723456789"
                    className=""
                    disabled={!!initialData}
                    {...register("dni")}
                  />
                </div>
                {errors.dni?.message && (
                  <p className="text-xs text-danger font-medium">
                    {errors.dni.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="number" className="ui-label">
                  Número de Camiseta
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                    <Hash className="w-4 h-4" />
                  </div>
                  <Input
                    id="number"
                    type="number"
                    placeholder="10"
                    className=""
                    {...register("number")}
                  />
                </div>
                {errors.number?.message && (
                  <p className="text-xs text-danger font-medium">
                    {errors.number.message}
                  </p>
                )}
              </div>
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

          <div className="space-y-1.5">
            <Select
              label="Equipo (Obligatorio)"
              id="teamId"
              error={errors.teamId?.message}
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
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="birthDate" className="ui-label">
              Fecha de Nacimiento
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <Input
                id="birthDate"
                type="date"
                className=""
                {...register("birthDate")}
              />
            </div>
            {errors.birthDate?.message && (
              <p className="text-xs text-danger font-medium">
                {errors.birthDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="imageUrl" className="ui-label">
              URL de la Imagen
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <ImageIcon className="w-4 h-4" />
              </div>
              <Input
                id="imageUrl"
                placeholder="https://ejemplo.com/jugador.png"
                className=""
                {...register("imageUrl")}
              />
            </div>
            {errors.imageUrl?.message && (
              <p className="text-xs text-danger font-medium">
                {errors.imageUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Checkbox id="isActive" {...register("isActive")} />
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
    </Modal>
  );
};
