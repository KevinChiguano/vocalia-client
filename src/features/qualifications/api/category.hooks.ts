import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../api/category.api";
import { CategoryFilters } from "../types/category.types";

export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: () => categoryApi.getCategories(filters),
  });
};
