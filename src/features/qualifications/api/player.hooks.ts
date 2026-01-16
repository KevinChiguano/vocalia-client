import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playerApi } from "../api/player.api";
import { PlayerFilters, UpdatePlayerDto } from "../types/player.types";

export const usePlayers = (filters?: PlayerFilters) => {
  return useQuery({
    queryKey: ["players", filters],
    queryFn: () => playerApi.getPlayers(filters),
  });
};

export const usePlayer = (dni: string) => {
  return useQuery({
    queryKey: ["player", dni],
    queryFn: () => playerApi.getPlayerByDni(dni),
    enabled: !!dni,
  });
};

export const useCreatePlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playerApi.createPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
};

export const useUpdatePlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ dni, data }: { dni: string; data: UpdatePlayerDto }) =>
      playerApi.updatePlayer(dni, data),
    onSuccess: (updatedPlayer) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({
        queryKey: ["player", updatedPlayer.dni],
      });
    },
  });
};

export const useDeletePlayer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: playerApi.deletePlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
};
