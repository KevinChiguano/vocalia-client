import { useQuery } from "@tanstack/react-query";
import { teamApi } from "../api/team.api";
import { TeamFilters } from "../types/team.types";

import { AxiosRequestConfig } from "axios";

export const useTeams = (
  filters?: TeamFilters,
  config?: AxiosRequestConfig,
) => {
  return useQuery({
    queryKey: ["teams", filters],
    queryFn: () => teamApi.getTeams(filters, config),
  });
};
