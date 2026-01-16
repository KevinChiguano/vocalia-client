import { api } from "@/api/axios.config";
import { PaginatedResponse } from "@/features/administration/types/league.types";
import {
  CreateTeamDto,
  Team,
  TeamFilters,
  UpdateTeamDto,
} from "../types/team.types";

import { AxiosRequestConfig } from "axios";

export const teamApi = {
  getTeams: async (
    params?: TeamFilters,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<Team>> => {
    const { data } = await api.get("/teams", { params, ...config });
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getTeamById: async (id: number): Promise<Team> => {
    const { data } = await api.get(`/teams/${id}`);
    return data.data;
  },

  createTeam: async (team: CreateTeamDto): Promise<Team> => {
    const { data } = await api.post("/teams", team);
    return data.data;
  },

  updateTeam: async (id: number, team: UpdateTeamDto): Promise<Team> => {
    const { data } = await api.put(`/teams/${id}`, team);
    return data.data;
  },

  deleteTeam: async (id: number): Promise<void> => {
    await api.delete(`/teams/${id}`);
  },
};
