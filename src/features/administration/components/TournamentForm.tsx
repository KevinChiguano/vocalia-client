import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Save } from "lucide-react";
import {
  Tournament,
  CreateTournamentDTO,
  UpdateTournamentDTO,
} from "../types/tournament.types";
import {
  useCreateTournament,
  useUpdateTournament,
} from "../hooks/useTournaments";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { formatDateForInput, isEndDateValid } from "@/utils/dateUtils";

const tournamentSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    startDate: z.string().optional().or(z.literal("")),
    endDate: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  })
  .refine((data) => isEndDateValid(data.startDate, data.endDate), {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["endDate"],
  });

type TournamentFormData = z.infer<typeof tournamentSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tournamentToEdit?: Tournament | null;
}

export const TournamentForm = ({
  isOpen,
  onClose,
  tournamentToEdit,
}: Props) => {
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (tournamentToEdit) {
        reset({
          name: tournamentToEdit.name,
          startDate: formatDateForInput(tournamentToEdit.startDate),
          endDate: formatDateForInput(tournamentToEdit.endDate),
          isActive: tournamentToEdit.isActive,
        });
      } else {
        reset({
          name: "",
          startDate: "",
          endDate: "",
          isActive: true,
        });
      }
    }
  }, [isOpen, tournamentToEdit, reset]);

  const onSubmit = async (data: TournamentFormData) => {
    try {
      if (tournamentToEdit) {
        const updateData: UpdateTournamentDTO = {
          name: data.name,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          isActive: data.isActive,
        };
        await updateMutation.mutateAsync({
          id: tournamentToEdit.id,
          data: updateData,
        });
      } else {
        const createData: CreateTournamentDTO = {
          name: data.name,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          isActive: data.isActive,
        };
        await createMutation.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving tournament:", error);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay animate-in fade-in duration-200">
      <div className="w-full max-w-md ui-card overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-elevated">
          <h2 className="type-h3 font-bold text-primary">
            {tournamentToEdit ? "Editar Torneo" : "Nuevo Torneo"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            pill
            onClick={onClose}
            className="text-text-muted hover:text-text h-9 w-9"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5 w-full">
            <Label
              htmlFor="name"
              className="text-xs font-bold text-text-muted uppercase tracking-wider"
            >
              Nombre del Torneo
            </Label>
            <Input
              id="name"
              placeholder="Ej: Torneo Apertura 2024"
              {...register("name")}
              autoFocus
            />
            {errors.name?.message && (
              <p className="text-xs text-danger font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 w-full">
              <Label
                htmlFor="startDate"
                className="text-xs font-bold text-text-muted uppercase tracking-wider"
              >
                Fecha Inicio
              </Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate?.message && (
                <p className="text-xs text-danger font-medium">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5 w-full">
              <Label
                htmlFor="endDate"
                className="text-xs font-bold text-text-muted uppercase tracking-wider"
              >
                Fecha Fin
              </Label>
              <Input id="endDate" type="date" {...register("endDate")} />
              {errors.endDate?.message && (
                <p className="text-xs text-danger font-medium">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveTournament"
              className="w-5 h-5 text-primary rounded border-border focus:ring-2 focus:ring-primary/30 cursor-pointer"
              {...register("isActive")}
            />
            <label
              htmlFor="isActiveTournament"
              className="ui-label cursor-pointer select-none"
            >
              Torneo Activo
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-2">
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
              loading={isLoading}
              className="gap-2 min-w-[140px] shadow-lg shadow-primary/20 relative"
            >
              <Save className="w-4 h-4" />
              <span>{tournamentToEdit ? "Guardar Cambios" : "Guardar"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
