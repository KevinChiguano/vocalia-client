import { api } from "@/api/axios.config";
import {
  Tournament,
  CreateTournamentDTO,
  UpdateTournamentDTO,
  TournamentFilters,
  PaginatedResponse,
} from "../types/tournament.types";

export const tournamentApi = {
  getTournamentsByLeague: async (
    filters: TournamentFilters
  ): Promise<PaginatedResponse<Tournament>> => {
    const { data } = await api.get("/tournaments", { params: filters });
    // Map backend response { items, pagination } to frontend expectation { data, meta }
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  getTournament: async (id: number): Promise<Tournament> => {
    const { data } = await api.get(`/tournaments/${id}`);
    return data.data;
  },

  createTournament: async (
    tournament: CreateTournamentDTO
  ): Promise<Tournament> => {
    const { data } = await api.post("/tournaments", tournament);
    return data.data;
  },

  updateTournament: async (
    id: number,
    tournament: UpdateTournamentDTO
  ): Promise<Tournament> => {
    const { data } = await api.put(`/tournaments/${id}`, tournament);
    return data.data;
  },

  deleteTournament: async (id: number): Promise<void> => {
    await api.delete(`/tournaments/${id}`);
  },
};
