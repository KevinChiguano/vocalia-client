import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vocaliaApi } from "../api/vocalia.api";
import { VocaliaFilters, Vocalia } from "../types/vocalia.types";

// Simple toast mock
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

import { useAuth } from "@/features/auth/hooks/useAuth";
import { scheduleApi } from "@/features/technical-commission/api/schedule.api";

export const useVocalias = (filters?: VocaliaFilters) => {
  const { user } = useAuth();
  // @ts-ignore - 'rol' might be the property name on the User object coming from the store
  const isAdmin = user?.role === "ADMIN" || user?.rol === "ADMIN";

  return useQuery({
    queryKey: ["vocalias", filters, isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        // Admins see all matches (active or scheduled)
        // We map them to "Vocalia" shape to reuse the UI
        const queryParams: any = {
          limit: filters?.limit || 100,
          page: filters?.page || 1,
          status: "programado,en_curso,finalizado",
        };

        const response = await scheduleApi.getMatches(queryParams);

        // scheduleApi.getMatches returns { items: [], pagination: {} } directly or wrapped in axios response
        // However, based on schedule.api.ts, it returns response.data
        // If response.data is the paginated object { items: [], pagination: {} }

        const responseData = (response as any).data || response;
        const matches = Array.isArray(responseData)
          ? responseData
          : responseData.items || [];

        const meta = responseData.pagination;

        const mappedVocalias: Vocalia[] = matches.map((match: any) => ({
          id: 0, // Dummy ID
          matchId: match.id,
          vocalUserId: 0, // Dummy
          localCaptainId: undefined, // Add missing props
          awayCaptainId: undefined,
          local_captain_id: undefined,
          away_captain_id: undefined,
          match: match,
        }));

        return { data: mappedVocalias, meta };
      }
      return vocaliaApi.getMyVocalias(filters);
    },
    staleTime: 5000,
  });
};

export const useMatchVocalia = (matchId: number) => {
  const { user } = useAuth();
  // @ts-ignore
  const isAdmin = user?.role === "ADMIN" || user?.rol === "ADMIN";

  return useQuery({
    queryKey: ["vocalia", matchId, isAdmin],
    queryFn: async () => {
      if (isAdmin) {
        const match = await scheduleApi.getMatchById(matchId);
        return {
          id: 0,
          matchId: match.id,
          vocalUserId: 0,
          localCaptainId: undefined,
          awayCaptainId: undefined,
          local_captain_id: undefined,
          away_captain_id: undefined, // Add missing props
          match: match,
        } as Vocalia;
      }
      return vocaliaApi.getVocaliaByMatch(matchId);
    },
    enabled: !!matchId,
  });
};

export const useMatchPlayers = (matchId: number) => {
  return useQuery({
    queryKey: ["match-players", matchId],
    queryFn: () => vocaliaApi.getMatchPlayers(matchId),
    enabled: !!matchId,
  });
};

export const useMatchGoals = (matchId: number) => {
  return useQuery({
    queryKey: ["match-goals", matchId],
    queryFn: () => vocaliaApi.getGoals(matchId),
    enabled: !!matchId,
  });
};

export const useMatchSanctions = (matchId: number) => {
  return useQuery({
    queryKey: ["match-sanctions", matchId],
    queryFn: () => vocaliaApi.getSanctions(matchId),
    enabled: !!matchId,
  });
};

export const useMatchSubstitutions = (matchId: number) => {
  return useQuery({
    queryKey: ["match-substitutions", matchId],
    queryFn: () => vocaliaApi.getSubstitutions(matchId),
    enabled: !!matchId,
  });
};

export const useVocaliasMutations = (matchId?: number) => {
  const queryClient = useQueryClient();

  const registerPlayers = useMutation({
    mutationFn: vocaliaApi.registerMatchPlayers,
    onSuccess: () => {
      toast.success("Jugadores registrados");
      if (matchId)
        queryClient.invalidateQueries({ queryKey: ["match-players", matchId] });
    },
    onError: () => toast.error("Error al registrar jugadores"),
  });

  const addGoal = useMutation({
    mutationFn: vocaliaApi.addGoal,
    onSuccess: () => {
      toast.success("Gol registrado");
      if (matchId) {
        queryClient.invalidateQueries({ queryKey: ["match-goals", matchId] });
        queryClient.invalidateQueries({ queryKey: ["vocalia", matchId] }); // For score update if included
      }
    },
    onError: () => toast.error("Error al registrar gol"),
  });

  const deleteGoal = useMutation({
    mutationFn: vocaliaApi.deleteGoal,
    onSuccess: () => {
      toast.success("Gol eliminado");
      if (matchId) {
        queryClient.invalidateQueries({ queryKey: ["match-goals", matchId] });
        queryClient.invalidateQueries({ queryKey: ["vocalia", matchId] });
      }
    },
  });

  const addSanction = useMutation({
    mutationFn: vocaliaApi.addSanction,
    onSuccess: () => {
      toast.success("Sanción registrada");
      if (matchId)
        queryClient.invalidateQueries({
          queryKey: ["match-sanctions", matchId],
        });
    },
    onError: () => toast.error("Error al registrar sanción"),
  });

  const deleteSanction = useMutation({
    mutationFn: vocaliaApi.deleteSanction,
    onSuccess: () => {
      toast.success("Sanción eliminada");
      if (matchId)
        queryClient.invalidateQueries({
          queryKey: ["match-sanctions", matchId],
        });
    },
  });

  const addSubstitution = useMutation({
    mutationFn: vocaliaApi.addSubstitution,
    onSuccess: () => {
      toast.success("Cambio registrado");
      if (matchId)
        queryClient.invalidateQueries({
          queryKey: ["match-substitutions", matchId],
        });
    },
    onError: () => toast.error("Error al registrar cambio"),
  });

  const deleteSubstitution = useMutation({
    mutationFn: vocaliaApi.deleteSubstitution,
    onSuccess: () => {
      toast.success("Cambio eliminado");
      if (matchId)
        queryClient.invalidateQueries({
          queryKey: ["match-substitutions", matchId],
        });
    },
  });

  const finalizeMatch = useMutation({
    mutationFn: (variables: {
      matchId: number;
      localScore: number;
      awayScore: number;
      vocaliaData?: any;
    }) =>
      vocaliaApi.finalizeMatch(variables.matchId, {
        localScore: variables.localScore,
        awayScore: variables.awayScore,
        vocaliaData: variables.vocaliaData,
      }),
    onSuccess: () => {
      toast.success("Partido finalizado");
      if (matchId)
        queryClient.invalidateQueries({ queryKey: ["vocalia", matchId] });
    },
    onError: () => toast.error("Error al finalizar partido"),
  });

  const updateStatus = useMutation({
    mutationFn: (variables: { matchId: number; status: string }) =>
      vocaliaApi.updateMatchStatus(variables.matchId, variables.status),
    onSuccess: () => {
      toast.success("Estado de partido actualizado");
      if (matchId)
        queryClient.invalidateQueries({ queryKey: ["vocalia", matchId] });
    },
    onError: () => toast.error("Error al actualizar estado"),
  });

  return {
    registerPlayers,
    addGoal,
    deleteGoal,
    addSanction,
    deleteSanction,
    addSubstitution,
    deleteSubstitution,
    finalizeMatch,
    updateStatus,
    updateVocalia: useMutation({
      mutationFn: (variables: { matchId: number; data: any }) =>
        vocaliaApi.updateVocalia(variables.matchId, variables.data),
      onSuccess: () => {
        toast.success("Vocalía actualizada");
        if (matchId)
          queryClient.invalidateQueries({ queryKey: ["vocalia", matchId] });
      },
      onError: () => toast.error("Error al actualizar vocalía"),
    }),
  };
};
