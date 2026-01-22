import { PaginatedResponse } from "@/types/api.types";

export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export type { PaginatedResponse };
