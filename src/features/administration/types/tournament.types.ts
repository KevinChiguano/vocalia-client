import { PaginatedResponse } from "@/types/api.types";

export interface Tournament {
  id: number;

  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTournamentDTO {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface UpdateTournamentDTO {
  name?: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface TournamentFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export type { PaginatedResponse };
