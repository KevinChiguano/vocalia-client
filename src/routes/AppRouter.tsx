import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import { NotFoundPage } from "@/features/misc/pages/NotFoundPage";
import { LeaguesPage } from "@/features/administration/pages/LeaguesPage";
import { TournamentsPage } from "@/features/administration/pages/TournamentsPage";
import QualificationsPage from "@/features/qualifications/pages/QualificationsPage";
import CarnetizationPage from "@/features/carnetization/pages/CarnetizationPage";

export const router = createBrowserRouter([
  // ================= AUTH =================
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },

  // ================= APP (cualquier usuario logueado) =================
  {
    element: <ProtectedRoute allowedRoles={["ADMIN", "VOCAL", "USER"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // ---------- HOME (todos) ----------
          {
            index: true,
            element: <HomePage />,
          },

          // ---------- ADMINISTRACIÓN (solo ADMIN) ----------
          {
            path: "administration",
            element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
            children: [
              {
                index: true,
                element: <Navigate to="leagues" replace />,
              },
              {
                path: "leagues",
                element: <LeaguesPage />,
              },
              {
                path: "leagues/:leagueId/tournaments",
                element: <TournamentsPage />,
              },
              // futuras rutas admin:
              // { path: "tournaments", element: <TournamentsPage /> },
            ],
          },

          // ---------- calificaciones (ADMIN, VOCAL, USER) ----------
          {
            path: "qualifications",
            element: <QualificationsPage />,
          },

          // ---------- carnetización (ADMIN, VOCAL, USER) ----------
          {
            path: "credentials",
            element: <CarnetizationPage />,
          },
        ],
      },
    ],
  },

  // ================= MISC =================
  {
    path: "/unauthorized",
    element: <div>No autorizado</div>,
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
