import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

import { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRoles?: Array<"ADMIN" | "VOCAL" | "USER">;
  children?: ReactNode;
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
