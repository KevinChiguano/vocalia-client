import { api } from "@/api/axios.config";
import {
  CreateLeagueDto,
  League,
  LeagueFilters,
  PaginatedResponse,
  UpdateLeagueDto,
} from "../types/league.types";

export const leagueApi = {
  getLeagues: async (
    params?: LeagueFilters
  ): Promise<PaginatedResponse<League>> => {
    const { data } = await api.get("/leagues", { params });
    // Map backend response { items, pagination } to frontend expectation { data, meta }
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getLeagueById: async (id: number): Promise<League> => {
    const { data } = await api.get(`/leagues/${id}`);
    return data.data;
  },

  createLeague: async (league: CreateLeagueDto): Promise<League> => {
    console.log("Creating league:", league);
    const { data } = await api.post("/leagues", league);

    return data.data;
  },

  updateLeague: async (
    id: number,
    league: UpdateLeagueDto
  ): Promise<League> => {
    const { data } = await api.put(`/leagues/${id}`, league);
    return data.data;
  },

  deleteLeague: async (id: number): Promise<void> => {
    const { data } = await api.delete(`/leagues/${id}`);
    return data.data;
  },
};
