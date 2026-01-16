import { api } from "@/api/axios.config";
import {
  Player,
  PlayerFilters,
  CreatePlayerDto,
  UpdatePlayerDto,
} from "../types/player.types";
import { PaginatedResponse } from "../types/category.types";

import { AxiosRequestConfig } from "axios";

export const playerApi = {
  getPlayers: async (
    params?: PlayerFilters,
    config?: AxiosRequestConfig
  ): Promise<PaginatedResponse<Player>> => {
    const { data } = await api.get("/players", { params, ...config });
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getPlayerByDni: async (dni: string): Promise<Player> => {
    const { data } = await api.get(`/players/${dni}`);
    return data.data;
  },

  createPlayer: async (player: CreatePlayerDto): Promise<Player> => {
    const { data } = await api.post("/players", player);
    return data.data;
  },

  updatePlayer: async (
    dni: string,
    player: UpdatePlayerDto
  ): Promise<Player> => {
    const { data } = await api.put(`/players/${dni}`, player);
    return data.data;
  },

  deletePlayer: async (dni: string): Promise<void> => {
    await api.delete(`/players/${dni}`);
  },
};
