import { login as loginApi } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import type { LoginRequest } from "../types";

export const useAuth = () => {
  const auth = useAuthStore();

  const login = async (payload: LoginRequest) => {
    const response = await loginApi(payload);

    if (response.success) {
      auth.login(response.data.user, response.data.token);
    }

    return response;
  };

  return {
    ...auth,
    login,
  };
};
