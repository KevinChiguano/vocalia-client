import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, MapPin } from "lucide-react";
import { Field, CreateFieldDto } from "../types/field.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";

const fieldSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(100, "El nombre es muy largo"),
  location: z
    .string()
    .max(255, "La ubicación es muy larga")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface Props {
  initialData?: Field | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFieldDto) => Promise<void>;
  isLoading?: boolean;
}

export const FieldForm = ({
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
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema) as any,
    defaultValues: {
      name: "",
      location: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initialData?.name || "",
        location: initialData?.location || "",
        isActive: initialData?.is_active ?? true,
      });
    }
  }, [initialData, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Editar Cancha" : "Nueva Cancha"}
      maxWidth="lg"
    >
      {/* Form */}
      <form
        onSubmit={handleSubmit((data) =>
          onSubmit(data as unknown as CreateFieldDto),
        )}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="ui-label">
              Nombre de la Cancha
            </Label>
            <Input
              id="name"
              placeholder="Ej: Cancha Central, Estadio Municipal"
              {...register("name")}
            />
            {errors.name?.message && (
              <p className="text-xs text-danger font-medium">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="ui-label">
                Ubicación / Dirección (Opcional)
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </div>
                <Input
                  id="location"
                  placeholder="Ej: Av. 123 y Calle 4"
                  className="pl-9"
                  {...register("location")}
                />
              </div>
              {errors.location?.message && (
                <p className="text-xs text-danger font-medium">
                  {errors.location.message}
                </p>
              )}
            </div>
            <p className="text-[10px] text-text-muted px-1">
              Tip: Puedes pegar un enlace de Google Maps aquí.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Checkbox id="isActive" {...register("isActive")} />
            <label
              htmlFor="isActive"
              className="ui-label cursor-pointer select-none"
            >
              Cancha Activa
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            className="gap-2 min-w-[140px] shadow-lg shadow-primary/20 relative"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cancha</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
