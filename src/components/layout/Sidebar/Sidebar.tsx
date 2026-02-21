import { SIDEBAR_ITEMS } from "./sidebar.config";
import { SidebarItem } from "./SidebarItem";
import { usePermissions } from "@/hooks/usePermissions";

import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState } from "react";

export const Sidebar = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate("/login", { replace: true });
    setIsLogoutOpen(false);
  };

  const handleLogoutClick = () => {
    setIsLogoutOpen(true);
  };

  return (
    <aside
      className={`ui-sidebar ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="ui-sidebar-nav">
        {SIDEBAR_ITEMS.filter(
          (item) => !item.permission || hasPermission(item.permission),
        ).map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="ui-sidebar-footer">
        <button onClick={handleLogoutClick} className="ui-sidebar-logout">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>

      <ConfirmModal
        open={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        title="¿Cerrar Sesión?"
        description="¿Estás seguro de que deseas cerrar tu sesión actual?"
        danger
        confirmText="Cerrar sesión"
      />
    </aside>
  );
};
