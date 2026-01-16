export interface League {
  id: number;
  name: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLeagueDto {
  name: string;
  imageUrl?: string;
}

export interface UpdateLeagueDto extends Partial<CreateLeagueDto> {
  isActive?: boolean;
}

export interface LeagueFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
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
