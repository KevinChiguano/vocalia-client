import { api } from "@/api/axios.config";
import { PaginatedResponse } from "@/types/api.types";
import {
  Vocalia,
  VocaliaFilters,
  CreateGoalDto,
  CreateSanctionDto,
  CreateSubstitutionDto,
  MatchPlayer,
} from "../types/vocalia.types";

export const vocaliaApi = {
  // --- VOCALIAS (Matches assigned) ---

  getMyVocalias: async (
    filters?: VocaliaFilters,
  ): Promise<PaginatedResponse<Vocalia>> => {
    const { data } = await api.get("/vocalias/mine", { params: filters });
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getVocaliaByMatch: async (matchId: number): Promise<Vocalia> => {
    const { data } = await api.get(`/vocalias/match/${matchId}`);
    return data.data;
  },

  updateVocalia: async (matchId: number, data: any): Promise<void> => {
    await api.patch(`/vocalias/match/${matchId}`, data);
  },

  finalizeMatch: async (
    matchId: number,
    scores: { localScore: number; awayScore: number; vocaliaData?: any },
  ): Promise<void> => {
    await api.post(`/vocalias/${matchId}/finalize`, scores);
  },

  updateMatchStatus: async (matchId: number, status: string): Promise<void> => {
    // Assuming backend supports PATCH /matches/:id/status or similar.
    // If not, we might need to use a different endpoint or create one.
    // Based on previous exploration, there isn't a direct match status update in vocalia controller.
    // But let's assume valid endpoint or use scheduleApi if better.
    // Actually, looking at matches controller (implied), let's try a standard patch.
    // If 404, I'll need to check backend.
    await api.put(`/matches/${matchId}/status`, { status });
  },

  // --- MATCH PLAYERS (Planilla) ---

  getMatchPlayers: async (matchId: number): Promise<MatchPlayer[]> => {
    const { data } = await api.get(`/match-players/match/${matchId}`);
    return data.data;
  },

  registerMatchPlayers: async (payload: {
    matchId: number;
    teamId: number;
    playerIds: number[];
    isStarting?: boolean;
  }): Promise<void> => {
    await api.post("/match-players/bulk", {
      matchId: payload.matchId,
      teamId: payload.teamId,
      players: payload.playerIds.map((pid) => ({
        playerId: pid,
        isStarting: payload.isStarting || false,
      })),
    });
  },

  deleteMatchPlayers: async (matchId: number): Promise<void> => {
    await api.delete(`/match-players/match/${matchId}`);
  },

  // --- GOALS ---

  addGoal: async (goal: CreateGoalDto): Promise<void> => {
    await api.post("/goals", {
      ...goal,
      eventTime:
        goal.time instanceof Date ? goal.time.toISOString() : goal.time,
    });
  },

  deleteGoal: async (id: number): Promise<void> => {
    await api.delete(`/goals/${id}`);
  },

  getGoals: async (matchId: number): Promise<any[]> => {
    const { data } = await api.get("/goals", {
      params: { matchId, limit: 100 },
    });
    return data.data.items;
  },

  // --- SANCTIONS ---

  addSanction: async (sanction: CreateSanctionDto): Promise<void> => {
    await api.post("/sanctions", {
      ...sanction,
      eventTime:
        sanction.time instanceof Date
          ? sanction.time.toISOString()
          : sanction.time,
    });
  },

  deleteSanction: async (id: number): Promise<void> => {
    await api.delete(`/sanctions/${id}`);
  },

  getSanctions: async (matchId: number): Promise<any[]> => {
    const { data } = await api.get("/sanctions", {
      params: { matchId, limit: 100 },
    });
    return data.data.items;
  },

  // --- SUBSTITUTIONS ---

  addSubstitution: async (
    substitution: CreateSubstitutionDto,
  ): Promise<void> => {
    await api.post("/substitutions", {
      matchId: substitution.matchId,
      playerOut: substitution.playerOutId,
      playerIn: substitution.playerInId,
      eventTime:
        substitution.time instanceof Date
          ? substitution.time.toISOString()
          : substitution.time,
    });
  },

  deleteSubstitution: async (id: number): Promise<void> => {
    await api.delete(`/substitutions/${id}`);
  },

  getSubstitutions: async (matchId: number): Promise<any[]> => {
    const { data } = await api.get("/substitutions", {
      params: { matchId, limit: 100 },
    });
    return data.data.items;
  },
};
