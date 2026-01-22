import { useState } from "react";
import {
  Plus,
  Search,
  X,
  UserCog,
  Shield,
  Mail,
  Power,
  Edit,
  Trash2,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { User } from "../types/user.types";
import { UserForm } from "../components/UserForm";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FiltersBar } from "@/components/ui/FiltersBar";
import { Pagination } from "@/components/ui/Pagination";
import { LimitSelector } from "@/components/ui/LimitSelector";
import { BaseTable } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { InlineSpinner } from "@/components/ui/InlineSpinner";
import { clsx } from "clsx";

export const UsersPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const [searchInput, setSearchInput] = useState("");
  const { usersQuery, toggleStatusMutation, deleteUserMutation } =
    useUsers(filters);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setFilters((prev) => ({ ...prev, search: "", page: 1 }));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteUserMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleStatus = (id: number) => {
    toggleStatusMutation.mutate(id);
  };

  const users = usersQuery.data?.data || [];
  const meta = usersQuery.data?.meta || {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  };

  const columns = [
    {
      key: "name",
      label: "Usuario",
      sortable: true,
      sortValue: (u: User) => u.name,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      sortValue: (u: User) => u.email,
    },
    {
      key: "role",
      label: "Rol",
      sortable: true,
      sortValue: (u: User) => u.roles?.name || "",
    },
    { key: "status", label: "Estado", width: "120px" },
    { key: "actions", label: "Acciones", width: "150px" },
  ];

  return (
    <div className="w-full px-0 sm:px-4 lg:px-6 2xl:max-w-screen-2xl 2xl:mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title={
          <>
            Gestión de <span className="text-primary">Usuarios</span>
          </>
        }
        description="Administra los accesos y roles del sistema"
        actions={
          <Button
            onClick={handleCreate}
            className="gap-2 shadow-lg hover:shadow-primary/25 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Nuevo Usuario</span>
          </Button>
        }
      />

      <FiltersBar
        left={
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative flex-1 sm:max-w-md">
              <Input
                placeholder="Buscar por nombre o email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pr-10"
              />
              {searchInput && (
                <Button
                  variant="ghost"
                  size="xs"
                  isIconOnly
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              variant="secondary"
              className="gap-2 w-full sm:w-auto"
            >
              <Search className="w-4 h-4" />
              <span>Buscar</span>
            </Button>
          </div>
        }
      />

      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <LimitSelector
            value={filters.limit}
            onChange={(limit) =>
              setFilters((prev) => ({ ...prev, limit, page: 1 }))
            }
          />
        </div>

        {usersQuery.isLoading ? (
          <div className="flex items-center justify-center py-20 bg-surface rounded-2xl border border-border">
            <InlineSpinner size={40} label="Cargando usuarios..." />
          </div>
        ) : users.length > 0 ? (
          <BaseTable
            columns={columns}
            data={users}
            renderRow={(user: User) => [
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                  <UserCog className="w-5 h-5" />
                </div>
                <span className="font-bold text-text">{user.name}</span>
              </div>,
              <div className="flex items-center gap-2 text-text-muted">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-sm">{user.email}</span>
              </div>,
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>{user.roles?.name || "Sin rol"}</span>
              </div>,
              <Badge variant={user.isActive ? "success" : "danger"} size="sm">
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>,
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(user)}
                  className="text-primary hover:bg-primary/10 border-primary/20"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleStatus(user.id)}
                  className={clsx(
                    "border-border/50",
                    user.isActive ? "text-success" : "text-text-muted",
                  )}
                  title={user.isActive ? "Desactivar" : "Activar"}
                >
                  <Power className="w-4 h-4" />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteClick(user.id)}
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>,
            ]}
            renderMobileRow={(user: User) => (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center text-primary">
                      <UserCog className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-text leading-tight">
                        {user.name}
                      </h4>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.isActive ? "success" : "danger"}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-xs text-text-muted">
                    <Shield className="w-3.5 h-3.5" />
                    <span>{user.roles?.name || "Sin rol"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      className="h-10 w-10 p-0"
                    >
                      <Edit className="w-4 h-4 text-primary" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id)}
                      className={clsx(
                        "h-10 w-10 p-0",
                        user.isActive ? "text-success" : "text-text-muted",
                      )}
                    >
                      <Power className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id)}
                      className="h-10 w-10 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-danger" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border border-dashed rounded-4xl">
            <div className="w-20 h-20 rounded-full bg-primary-soft flex items-center justify-center mb-6">
              <UserCog className="w-10 h-10 text-primary opacity-30" />
            </div>
            <p className="text-text font-bold text-xl">
              No se encontraron usuarios
            </p>
            <p className="text-text-muted text-center max-w-sm px-4">
              {filters.search
                ? "Prueba ajustando los filtros o realiza una nueva búsqueda."
                : "Empieza registrando nuevos usuarios en el sistema."}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-text-muted">
            Mostrando {users.length} de {meta.total} usuarios
          </p>
          {meta.totalPages > 1 && (
            <Pagination
              page={meta.page}
              totalPages={meta.totalPages}
              onChange={(page) => setFilters((prev) => ({ ...prev, page }))}
            />
          )}
        </div>
      </div>

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        userToEdit={editingUser}
      />

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};
