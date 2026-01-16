import { useQuery } from "@tanstack/react-query";
import { teamApi } from "../api/team.api";
import { TeamFilters } from "../types/team.types";

export const useTeams = (filters?: TeamFilters) => {
  return useQuery({
    queryKey: ["teams", filters],
    queryFn: () => teamApi.getTeams(filters),
  });
};
