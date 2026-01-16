import { Team } from "@/features/qualifications/types/team.types";

export interface TournamentTeam {
  id: number;
  tournamentId: number;
  teamId: number;
  categoryId?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  createdAt: string;
  updatedAt?: string;
  team?: Team;
}

export interface RegisterTeamInput {
  tournamentId: number;
  teamId: number;
  categoryId?: number;
}
