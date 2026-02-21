import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Save, User as UserIcon, Mail, Lock, Shield } from "lucide-react";
import { User, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { useUsers } from "../hooks/useUsers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Modal } from "@/components/ui/Modal";
import { Checkbox } from "@/components/ui/Checkbox";

const userSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().optional().or(z.literal("")),
  rol_id: z.number().min(1, "Debe seleccionar un rol"),
  isActive: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export const UserForm = ({ isOpen, onClose, userToEdit }: Props) => {
  const { createUserMutation, updateUserMutation, rolesQuery } = useUsers();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      rol_id: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        reset({
          name: userToEdit.name,
          email: userToEdit.email,
          password: "",
          rol_id: userToEdit.roles?.id || 0,
          isActive: userToEdit.isActive,
        });
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          rol_id: 0,
          isActive: true,
        });
      }
    }
  }, [isOpen, userToEdit, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      if (userToEdit) {
        const updateData: UpdateUserDto = {
          name: data.name,
          email: data.email,
          rol_id: data.rol_id,
          is_active: data.isActive,
        };
        if (data.password) updateData.password = data.password;

        await updateUserMutation.mutateAsync({
          id: userToEdit.id,
          data: updateData,
        });
      } else {
        const createData: CreateUserDto = {
          name: data.name,
          email: data.email,
          password: data.password || "123456", // Default password if empty
          rol_id: data.rol_id,
        };
        await createUserMutation.mutateAsync(createData);
      }
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const isLoading =
    createUserMutation.isPending || updateUserMutation.isPending;
  const roles = rolesQuery.data || [];

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
      maxWidth="md"
    >
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5 w-full">
          <Label
            htmlFor="name"
            className="text-xs font-bold text-text-muted uppercase tracking-wider"
          >
            Nombre Completo
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              <UserIcon className="w-4 h-4" />
            </div>
            <Input
              id="name"
              placeholder="Ej: Juan Pérez"
              className="pl-9"
              {...register("name")}
              autoFocus
            />
          </div>
          {errors.name?.message && (
            <p className="text-xs text-danger font-medium">
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 w-full">
          <Label
            htmlFor="email"
            className="text-xs font-bold text-text-muted uppercase tracking-wider"
          >
            Correo Electrónico
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              id="email"
              placeholder="juan@ejemplo.com"
              type="email"
              className="pl-9"
              {...register("email")}
            />
          </div>
          {errors.email?.message && (
            <p className="text-xs text-danger font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5 w-full">
          <Label
            htmlFor="password"
            className="text-xs font-bold text-text-muted uppercase tracking-wider"
          >
            {userToEdit ? "Nueva Contraseña (opcional)" : "Contraseña"}
          </Label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
              <Lock className="w-4 h-4" />
            </div>
            <Input
              id="password"
              placeholder="********"
              type="password"
              className="pl-9"
              {...register("password")}
            />
          </div>
          {errors.password?.message && (
            <p className="text-xs text-danger font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

        <Select
          label="Rol de Usuario"
          icon={<Shield className="w-4 h-4" />}
          error={errors.rol_id?.message}
          {...register("rol_id", { valueAsNumber: true })}
        >
          <option value={0} disabled>
            Seleccionar rol...
          </option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>

        {userToEdit && (
          <div className="flex items-center gap-2 pt-2">
            <Checkbox id="isActiveUser" {...register("isActive")} />
            <label
              htmlFor="isActiveUser"
              className="ui-label cursor-pointer select-none"
            >
              Usuario Activo
            </label>
          </div>
        )}

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
            <span>{userToEdit ? "Guardar Cambios" : "Guardar"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};
