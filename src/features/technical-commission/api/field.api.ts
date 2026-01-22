import { api } from "@/api/axios.config";
import { Field, CreateFieldDto, UpdateFieldDto } from "../types/field.types";

export const fieldApi = {
  getFields: async (): Promise<Field[]> => {
    const { data } = await api.get("/fields");
    return data.data;
  },

  getFieldById: async (id: number): Promise<Field> => {
    const { data } = await api.get(`/fields/${id}`);
    return data.data;
  },

  createField: async (field: CreateFieldDto): Promise<Field> => {
    const { data } = await api.post("/fields", field);
    return data.data;
  },

  updateField: async (id: number, field: UpdateFieldDto): Promise<Field> => {
    const { data } = await api.put(`/fields/${id}`, field);
    return data.data;
  },

  deleteField: async (id: number): Promise<void> => {
    await api.delete(`/fields/${id}`);
  },
};
