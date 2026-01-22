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
  };
  team: {
    id: number;
    name: string;
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
  };
  team: string; // Note: API returns string name, not object? Let's verify controller response again if needed.
  goals: number;
}

// Controller "topScorers" response:
// { player: {id, name}, team: string, goals: number }
