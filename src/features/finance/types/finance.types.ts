export interface FinancialSummary {
  totalRevenue: number;
  pendingPayments: number;
  collectedToday: number;
  outstandingDebtsAmount: number;
}

export interface FinancialTransaction {
  id: number;
  matchId: number;
  teams: {
    local: string;
    away: string;
    localId: number | null;
    awayId: number | null;
  };
  category: string;
  date: string;
  paymentTeamA: number;
  paymentTeamB: number;
  totalMatchRevenue: number;
  status: "paid" | "partial" | "pending";
}

export interface FinancialsResponse {
  summary: FinancialSummary;
  transactions: FinancialTransaction[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
