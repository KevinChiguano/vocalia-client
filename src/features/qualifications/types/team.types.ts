import { Category } from "./category.types";

export interface Team {
  id: number;
  name: string;
  logo?: string;
  categoryId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CreateTeamDto {
  name: string;
  logo?: string;
  categoryId: number;
  isActive?: boolean;
}

export interface UpdateTeamDto extends Partial<CreateTeamDto> {}

export interface TeamFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  category?: string | number;
  tournamentId?: number;
}
