import { useQuery } from "@tanstack/react-query";
import { categoryApi } from "../api/category.api";
import { CategoryFilters } from "../types/category.types";

import { AxiosRequestConfig } from "axios";

export const useCategories = (
  filters?: CategoryFilters,
  config?: AxiosRequestConfig,
) => {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: () => categoryApi.getCategories(filters, config),
  });
};
