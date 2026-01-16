import { SIDEBAR_ITEMS } from "./sidebar.config";
import { SidebarItem } from "./SidebarItem";
import { usePermissions } from "@/hooks/usePermissions";

import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";

export const Sidebar = () => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const handleLogout = () => {
    if (!window.confirm("¿Deseas cerrar sesión?")) return;
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`ui-sidebar ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <nav className="ui-sidebar-nav">
        {SIDEBAR_ITEMS.filter(
          (item) => !item.permission || hasPermission(item.permission)
        ).map((item) => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>

      <div className="ui-sidebar-footer">
        <button onClick={handleLogout} className="ui-sidebar-logout">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};
