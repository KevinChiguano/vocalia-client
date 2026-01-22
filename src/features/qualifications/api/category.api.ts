import { api } from "@/api/axios.config";
import {
  Category,
  CategoryFilters,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../types/category.types";
import { PaginatedResponse } from "@/types/api.types";

import { AxiosRequestConfig } from "axios";

export const categoryApi = {
  getCategories: async (
    params?: CategoryFilters,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<Category>> => {
    const { data } = await api.get("/categories", { params, ...config });
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getCategoryById: async (id: number): Promise<Category> => {
    const { data } = await api.get(`/categories/${id}`);
    return data.data;
  },

  createCategory: async (category: CreateCategoryDto): Promise<Category> => {
    const { data } = await api.post("/categories", category);
    return data.data;
  },

  updateCategory: async (
    id: number,
    category: UpdateCategoryDto,
  ): Promise<Category> => {
    const { data } = await api.put(`/categories/${id}`, category);
    return data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
