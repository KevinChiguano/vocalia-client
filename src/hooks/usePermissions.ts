import { useAuthStore } from "@/store/auth.store";
import { ROLE_PERMISSIONS, type Permission } from "@/types/permissions";

export const usePermissions = () => {
  const user = useAuthStore((s) => s.user);

  const permissions = user ? ROLE_PERMISSIONS[user.rol] ?? [] : [];

  const hasPermission = (permission: Permission) =>
    permissions.includes(permission);

  const hasAnyPermission = (list: Permission[]) =>
    list.some((p) => permissions.includes(p));

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
  };
};
