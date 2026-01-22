import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tournamentApi } from "../api/tournament.api";
import {
  UpdateTournamentDTO,
  TournamentFilters,
} from "../types/tournament.types";

export const useTournaments = (filters?: TournamentFilters) => {
  return useQuery({
    queryKey: ["tournaments", filters],
    queryFn: () => tournamentApi.getTournaments(filters ?? {}),
  });
};

export const useTournament = (id: number) => {
  return useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournamentApi.getTournament(id),
    enabled: !!id,
  });
};

export const useCreateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentApi.createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tournaments"],
      });
    },
  });
};

export const useUpdateTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTournamentDTO }) =>
      tournamentApi.updateTournament(id, data),
    onSuccess: (updatedTournament) => {
      queryClient.invalidateQueries({
        queryKey: ["tournaments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tournament", updatedTournament.id],
      });
    },
  });
};

export const useDeleteTournament = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tournamentApi.deleteTournament,
    onSuccess: () => {
      // We might not know the leagueId here easily without extra context or passing it.
      // A broad invalidation is safe for now, or we can pass leagueId in mutation context if needed.
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
};
