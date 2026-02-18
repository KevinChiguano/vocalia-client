import { useState } from "react";
import { LogOut } from "lucide-react";
import logo from "@/assets/logo_san_fernando.png";
import { useAuthStore } from "@/store/auth.store";
//import { useUIStore } from "@/store/ui.store";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useNavigate } from "react-router-dom";
import { ConfirmModal } from "../ui/ConfirmModal";

export const Topbar = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  //const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  const [openModal, setOpenModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50
      h-16 bg-topbar text-topbar-text
      border-b border-border
      flex items-center justify-between px-4"
    >
      {/* IZQUIERDA: botón + logo + texto */}
      <div className="flex items-center gap-3">
        {/* <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-primary-hover transition-colors"
          aria-label="Mostrar u ocultar menú"
        >
          <Menu className="w-6 h-6" />
        </button> */}

        <img src={logo} alt="Logo" className="h-8" />

        <span className="font-semibold text-sm hidden sm:block">
          Liga San Fernando
        </span>
      </div>

      {/* DERECHA: acciones */}
      <div className="flex items-center gap-4">
        <ThemeToggle context="topbar" />

        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs mt-1">{user?.rol}</p>
          </div>
          <div
            className="w-9 h-9 rounded-full bg-danger text-white
                          flex items-center justify-center text-sm font-bold
                          border border-border"
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={() => setOpenModal(true)}
            aria-label="Cerrar sesión"
            className="p-2 rounded-full
            text-topbar-text
            hover:bg-topbar-hover"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        open={openModal}
        title="Cerrar sesión"
        description="¿Seguro que deseas cerrar sesión?"
        danger
        confirmText="Cerrar sesión"
        onClose={() => setOpenModal(false)}
        onConfirm={() => {
          setOpenModal(false);
          handleLogout();
        }}
      />
    </header>
  );
};
