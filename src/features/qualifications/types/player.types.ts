import { Team } from "./team.types";
import { Category } from "./category.types";

export interface Player {
  dni: string;
  name: string;
  lastname?: string;
  number?: number;
  teamId: number;
  cardUrl?: string;
  imageUrl?: string;
  birthDate?: string;
  categoryId?: number;
  isActive: boolean;
  createAt: string;
  updateAt: string;
  team?: Team;
  category?: Category;
}

export interface CreatePlayerDto {
  dni: string;
  name: string;
  lastname?: string;
  number?: number;
  teamId: number;
  cardUrl?: string;
  imageUrl?: string;
  birthDate?: string;
  categoryId?: number;
  isActive?: boolean;
}

export interface UpdatePlayerDto
  extends Partial<Omit<CreatePlayerDto, "dni">> {}

export interface PlayerFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
  teamId?: number;
  categoryId?: number;
  team?: number; // Backend uses team query param
  category?: number; // Backend uses category query param
}
