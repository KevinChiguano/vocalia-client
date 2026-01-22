import { api } from "@/api/axios.config";
import { PaginatedResponse } from "@/types/api.types";
import {
  GlobalDashboardStats,
  PlayerStats,
  TeamStats,
  TopScorerStats,
} from "../types/statistics.types";

export const statisticsApi = {
  getGlobalDashboard: async (): Promise<GlobalDashboardStats> => {
    const { data } = await api.get("/statistics/dashboard");
    return data.data;
  },

  getTournamentDashboard: async (tournamentId: number): Promise<any> => {
    const { data } = await api.get(
      `/statistics/tournaments/${tournamentId}/dashboard`,
    );
    return data.data;
  },

  getStandings: async (tournamentId: number): Promise<TeamStats[]> => {
    const { data } = await api.get(
      `/statistics/tournaments/${tournamentId}/teams`,
    );
    return data.data;
  },

  getTopScorers: async (
    tournamentId: number,
    limit = 10,
  ): Promise<TopScorerStats[]> => {
    const { data } = await api.get(
      `/statistics/tournaments/${tournamentId}/top-scorers`,
      {
        params: { limit },
      },
    );
    return data.data;
  },

  getPlayersStats: async (
    tournamentId: number,
    page = 1,
    limit = 20,
  ): Promise<PaginatedResponse<PlayerStats>> => {
    const { data } = await api.get(
      `/statistics/tournaments/${tournamentId}/players`,
      {
        params: { page, limit },
      },
    );
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },
};
