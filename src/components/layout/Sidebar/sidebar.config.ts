import {
  Trophy,
  List,
  LayoutGrid,
  LayoutDashboard,
  Users,
  Settings,
  ClipboardList,
} from "lucide-react";

import type { Permission } from "@/types/permissions";

export interface SidebarItem {
  label: string;
  icon: React.ElementType;
  to?: string; // opcional (no todos navegan)
  permission?: Permission;
  children?: SidebarItem[]; // soporte jerárquico
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Dashboard",
    to: "/",
    icon: LayoutDashboard,
    permission: "dashboard.view",
  },
  {
    label: "Usuarios",
    to: "/usuarios",
    icon: Users,
    permission: "users.manage",
  },
  {
    label: "Torneos",
    icon: Trophy,
    children: [
      {
        label: "Gestionar torneos",
        to: "/tournaments/list",
        icon: List,
      },
      {
        label: "Ver torneos",
        to: "/tournaments/cards",
        icon: LayoutGrid,
      },
    ],
  },
  {
    label: "Vocalías",
    to: "/vocalias",
    icon: ClipboardList,
    permission: "vocalias.manage",
  },
  {
    label: "Configuración",
    to: "/configuracion",
    icon: Settings,
    permission: "settings.manage",
  },
];
