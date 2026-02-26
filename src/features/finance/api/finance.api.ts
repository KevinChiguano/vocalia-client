import { api } from "@/api/axios.config";
import { FinancialsResponse } from "../types/finance.types";

export const financeApi = {
  getFinancials: async (filters?: {
    tournamentId?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    // Adjusted route path considering vocalias prefix inside httpClient or not
    // Assuming backend is mapped under /vocalias in routes.ts
    const response = await api.get<{
      ok: boolean;
      data: FinancialsResponse;
    }>("/vocalias/financials", { params: filters });
    return response.data.data;
  },

  getFinancialsExport: async (filters?: {
    tournamentId?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) => {
    // Send limit: 10000 to fetch effectively all visible resources for PDF/Excel export
    const response = await api.get<{
      ok: boolean;
      data: FinancialsResponse;
    }>("/vocalias/financials", {
      params: { ...filters, limit: 10000, page: 1 },
    });

    return response.data.data;
  },
};
