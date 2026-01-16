import { api } from "./axios.config";
import { LoginRequest, LoginResponse, User } from "@/features/auth/types";

export const login = async (payload: LoginRequest) => {
  const response = await api.post<LoginResponse>("/auth/login", payload);

  return response.data;
};

export const me = async () => {
  const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
  return data;
};
