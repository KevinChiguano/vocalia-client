import { api } from "@/api/axios.config";
import { User, Role, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { PaginatedResponse } from "@/types/api.types";

export const userApi = {
  getUsers: async (filters: any = {}): Promise<PaginatedResponse<User>> => {
    const { data } = await api.get("/users", { params: filters });
    return {
      data: data.data.items,
      meta: data.data.pagination,
    };
  },

  createUser: async (userData: CreateUserDto): Promise<User> => {
    const { data } = await api.post("/users", userData);
    return data.data;
  },

  updateUser: async (id: number, userData: UpdateUserDto): Promise<User> => {
    const { data } = await api.patch(`/users/${id}`, userData);
    return data.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleUserStatus: async (id: number): Promise<User> => {
    const { data } = await api.patch(`/users/${id}/toggle-status`);
    return data.data;
  },

  getRoles: async (): Promise<Role[]> => {
    const { data } = await api.get("/roles");
    return data.data;
  },
};
