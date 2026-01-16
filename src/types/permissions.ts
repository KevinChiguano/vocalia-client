import type { UserRole } from "@/features/auth/types";

export type Permission =
  | "dashboard.view"
  | "users.manage"
  | "matches.manage"
  | "matches.view"
  | "vocalias.manage"
  | "settings.manage";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "dashboard.view",
    "users.manage",
    "matches.manage",
    "vocalias.manage",
    "settings.manage",
  ],

  VOCAL: ["dashboard.view", "matches.view", "vocalias.manage"],

  USER: ["dashboard.view", "matches.view"],
};
