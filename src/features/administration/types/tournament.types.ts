export interface Tournament {
  id: number;
  leagueId: number;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTournamentDTO {
  leagueId: number;
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
  leagueId?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
