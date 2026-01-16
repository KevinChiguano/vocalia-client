export type UserRole = "ADMIN" | "VOCAL" | "USER";

export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  rol: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}
