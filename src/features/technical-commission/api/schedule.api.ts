import { api } from "@/api/axios.config";

export interface ProgrammingSheetRow {
  matchDate: string;
  time: string;
  localTeamId: number;
  awayTeamId: number;
  category: string;
  vocalUserId: number;
  fieldId?: number;
}

export interface ProgrammingSheetInput {
  tournamentId: number;
  stage: string;
  matchDay: number;
  rows: ProgrammingSheetRow[];
}

export const scheduleApi = {
  saveProgrammingSheet: async (data: ProgrammingSheetInput) => {
    const response = await api.post("/matches/programming-sheet", data);
    return response.data;
  },

  createMatch: async (data: {
    tournamentId: number;
    stage: string;
    matchDate: string;
    localTeamId: number;
    awayTeamId: number;
    categoryId?: number;
    vocalUserId?: number;
    fieldId?: number;
  }) => {
    const response = await api.post("/matches", data);
    return response.data;
  },

  getMatches: async (params: {
    tournamentId?: number;
    matchDay?: number;
    stage?: string;
    matchDateFrom?: string;
    matchDateTo?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/matches", { params });
    return response.data;
  },

  getMatchById: async (id: number) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },

  updateMatch: async (id: number, data: any) => {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
  },

  deleteMatch: async (id: number) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  },
};
