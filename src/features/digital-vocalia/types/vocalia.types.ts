export interface Goal {
  id: number;
  matchId: number;
  playerId: number;
  time: string; // ISO event time
  isOwnGoal: boolean;
}

export interface CreateGoalDto {
  matchId: number;
  playerId: number;
  time: Date;
  isOwnGoal?: boolean;
}

export interface Sanction {
  id: number;
  matchId: number;
  playerId: number;
  type: "amarilla" | "roja_directa" | "doble_amarilla";
  description?: string;
  time: string;
}

export interface CreateSanctionDto {
  matchId: number;
  playerId: number;
  type: "amarilla" | "roja_directa" | "doble_amarilla";
  description?: string;
  time: Date;
}

export interface Substitution {
  id: number;
  matchId: number;
  playerOutId: number;
  playerInId: number;
  time: string;
}

export interface CreateSubstitutionDto {
  matchId: number;
  playerOutId: number;
  playerInId: number;
  time: Date;
}

export interface MatchPlayer {
  id: number;
  isStarting: boolean;
  player?: {
    id: number;
    name: string; // Contains full name
    number?: number;
  };
  team?: {
    id: number;
    name: string;
  };
}

export interface Vocalia {
  id: number;
  matchId: number;
  vocalUserId: number;
  localCaptainId?: number;
  awayCaptainId?: number;
  local_captain_id?: number;
  away_captain_id?: number;
  observations?: string;
  vocaliaData?: any;
  arbitratorName?: string;
  signatures?: {
    local?: string;
    away?: string;
  };
  match?: any; // We might need a proper Match type here
}

export interface VocaliaFilters {
  page?: number;
  limit?: number;
}
