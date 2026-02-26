export interface GlobalDashboardStats {
  counts: {
    tournaments: number;
    teams: number;
    players: number;
    matches: number;
    goals: number;
    yellowCards: number;
    redCards: number;
  };
}

export interface PlayerStats {
  player: {
    id: number;
    name: string;
    number: number;
    image?: string;
  };
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  matchesPlayed: number;
  goals: number;
  yellowCards: number;
  redCards: number;
}

export interface TeamStats {
  team: {
    id: number;
    name: string;
    logo?: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  yellowCards: number;
  redCards: number;
}

export interface TopScorerStats {
  player: {
    id: number;
    name: string;
    image?: string;
  };
  team: {
    name: string;
    logo?: string;
  };
  goals: number;
}

// Controller "topScorers" response:
// { player: {id, name}, team: string, goals: number }
