import { api } from "@/api/axios.config";
import {
  TournamentTeam,
  RegisterTeamInput,
} from "../types/tournamentTeam.types";

export const tournamentTeamApi = {
  getTournamentTeams: async (
    tournamentId: number
  ): Promise<TournamentTeam[]> => {
    const { data } = await api.get(
      `/tournament-teams/tournament/${tournamentId}`
    );
    return data.data;
  },

  registerTeam: async (input: RegisterTeamInput): Promise<TournamentTeam> => {
    const { data } = await api.post("/tournament-teams", input);
    return data.data;
  },

  removeTeam: async (id: number): Promise<void> => {
    await api.delete(`/tournament-teams/${id}`);
  },
};
