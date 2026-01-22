import { createBrowserRouter, Navigate } from "react-router-dom";

import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import LoginPage from "@/features/auth/pages/LoginPage";
import HomePage from "@/features/home/pages/HomePage";
import { NotFoundPage } from "@/features/misc/pages/NotFoundPage";

import { TournamentsPage } from "@/features/administration/pages/TournamentsPage";
import { TournamentTeamsPage } from "@/features/administration/pages/TournamentTeamsPage";
import { UsersPage } from "@/features/administration/pages/UsersPage";
import QualificationsPage from "@/features/qualifications/pages/QualificationsPage";
import CarnetizationPage from "@/features/carnetization/pages/CarnetizationPage";
import { TechnicalCommissionPage } from "@/features/technical-commission/pages/TechnicalCommissionPage";
import DigitalVocaliaPage from "@/features/digital-vocalia/pages/DigitalVocaliaPage";
import MatchControlPage from "@/features/digital-vocalia/pages/MatchControlPage";
import StatisticsPage from "@/features/statistics/pages/StatisticsPage";

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
                element: <Navigate to="tournaments" replace />,
              },
              {
                path: "tournaments",
                children: [
                  {
                    index: true,
                    element: <TournamentsPage />,
                  },
                  {
                    path: ":id/teams",
                    element: <TournamentTeamsPage />,
                  },
                ],
              },
              {
                path: "users",
                element: <UsersPage />,
              },
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

          {
            path: "technical-commission",
            element: <TechnicalCommissionPage />,
          },

          // ---------- VOCALÍA DIGITAL (ADMIN, VOCAL, USER-readonly) ----------
          {
            path: "digital-vocalia",
            children: [
              {
                index: true,
                element: <DigitalVocaliaPage />,
              },
              {
                path: ":matchId",
                element: <MatchControlPage />,
              },
            ],
          },

          // ---------- ESTADÍSTICAS (todos) ----------
          {
            path: "statistics",
            element: <StatisticsPage />,
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
