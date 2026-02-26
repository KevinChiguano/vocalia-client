import { api } from "@/api/axios.config";
import {
  RegulationArticle,
  CreateRegulationDTO,
  UpdateRegulationDTO,
} from "../types/regulation.types";

export const regulationApi = {
  // Públicas / Usuarios
  getAllActive: async (): Promise<RegulationArticle[]> => {
    const response = await api.get("/regulation");
    return response.data;
  },

  // Admin
  getAllAdmin: async (): Promise<RegulationArticle[]> => {
    const response = await api.get("/regulation/admin");
    return response.data;
  },

  getById: async (id: number): Promise<RegulationArticle> => {
    const response = await api.get(`/regulation/${id}`);
    return response.data;
  },

  create: async (data: CreateRegulationDTO): Promise<RegulationArticle> => {
    const response = await api.post("/regulation", data);
    return response.data;
  },

  update: async (
    id: number,
    data: UpdateRegulationDTO,
  ): Promise<RegulationArticle> => {
    const response = await api.put(`/regulation/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/regulation/${id}`);
  },
};
